const xlsx = require('xlsx');
const path = require('path');
const db = require('./config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function importData() {
    const filePath = path.join(__dirname, '../Liste des postes.xlsx');
    console.log(`📖 Reading file: ${filePath}`);
    
    let workbook;
    try {
        workbook = xlsx.readFile(filePath);
    } catch (err) {
        console.error('❌ Error reading file:', err.message);
        process.exit(1);
    }

    // 1. Map Structure (Site -> Poste -> Department)
    // We need to know which department a 'Poste' belongs to within a Site.
    const structureMap = {
        'TT': {},  // 'Poste Name' -> 'Department Name'
        'TTG': {}
    };

    const sites = ['TT', 'TTG'];

    for (const site of sites) {
        if (!workbook.Sheets[site]) {
            console.warn(`⚠️  Sheet '${site}' not found. Skipping.`);
            continue;
        }

        const data = xlsx.utils.sheet_to_json(workbook.Sheets[site], { defval: "" });
        let currentDept = null;

        console.log(`\n🏗️  Processing Structure for ${site}...`);
        
        for (const row of data) {
            // Excel Merge Logic: If Departement is filled, update current. If empty, use current.
            // Column names might have spaces, trim keys
            const rowClean = {};
            Object.keys(row).forEach(k => rowClean[k.trim()] = row[k]);

            const deptVal = rowClean['Departement'];
            const posteVal = rowClean['Poste'];

            if (deptVal && deptVal.trim() !== '') {
                currentDept = deptVal.trim();
            }

            if (posteVal && posteVal.trim() !== '') {
                // Determine Department Name (Use Current or Default)
                const deptName = currentDept || 'General';
                structureMap[site][posteVal.trim()] = deptName;
                
                // Ensure Department Exists in DB
                await ensureDepartment(site, deptName);
                
                // Ensure Role Exists in DB
                // We use the 'Poste' name as the Role name
                await ensureRole(posteVal.trim());
            }
        }
    }

    // 2. Import Users from Email Sheets
    const emailSheets = {
        'TT': 'Email_TT',
        'TTG': 'Email_TTG'
    };

    const defaultPasswordHash = await bcrypt.hash('Password123!', 10);

    for (const [site, sheetName] of Object.entries(emailSheets)) {
        if (!workbook.Sheets[sheetName]) {
            console.warn(`⚠️  Sheet '${sheetName}' not found. Skipping.`);
            continue;
        }

        console.log(`\n👥 Processing Users for ${site} from ${sheetName}...`);
        const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: "" });

        for (const row of data) {
            const rowClean = {};
            Object.keys(row).forEach(k => rowClean[k.trim()] = row[k]);

            const poste = rowClean['Poste'] ? rowClean['Poste'].trim() : null;
            const email = rowClean['Email'] ? rowClean['Email'].trim() : null;

            if (!email || !poste) continue;

            // Find Department
            const departmentName = structureMap[site][poste];
            if (!departmentName) {
                console.warn(`   ⚠️  Poste '${poste}' found in email list but NOT in structure sheet for ${site}. Assigning to 'General'.`);
                await ensureDepartment(site, 'General');
            }
            
            const targetDeptName = departmentName || 'General';

            // Extract Name from Email (first.last@...)
            const namePart = email.split('@')[0];
            const fullName = namePart.split('.')
                .map(s => s.charAt(0).toUpperCase() + s.slice(1))
                .join(' ');

            // DB Operations
            await ensureUser(fullName, email, poste, site, targetDeptName, defaultPasswordHash);
        }
    }

    console.log('\n✅ Import completed successfully.');
    process.exit(0);
}

// --- Helper Functions ---

const deptCache = {}; // Key: Site-DeptName -> ID
const roleCache = {}; // Key: RoleName -> ID

async function ensureDepartment(siteId, deptName) {
    const key = `${siteId}-${deptName}`;
    if (deptCache[key]) return deptCache[key];

    // Check DB
    const [rows] = await db.query('SELECT id FROM Department WHERE name = ? AND siteId = ?', [deptName, siteId]);
    if (rows.length > 0) {
        deptCache[key] = rows[0].id;
        return rows[0].id;
    }

    // Create
    const id = uuidv4();
    // Default values for required fields
    await db.query(`
        INSERT INTO Department (id, name, siteId, head, location, budget) 
        VALUES (?, ?, ?, 'TBD', 'Main Office', 0)
    `, [id, deptName, siteId]);
    
    console.log(`   Created Department: ${deptName} (${siteId})`);
    deptCache[key] = id;
    return id;
}

async function ensureRole(roleName) {
    if (roleCache[roleName]) return roleCache[roleName];

    // Check DB (Role Name must be unique)
    const [rows] = await db.query('SELECT id FROM Role WHERE name = ?', [roleName]);
    if (rows.length > 0) {
        roleCache[roleName] = rows[0].id;
        return rows[0].id;
    }

    // Create
    const id = uuidv4();
    await db.query('INSERT INTO Role (id, name, description) VALUES (?, ?, ?)', [id, roleName, roleName]);
    console.log(`   Created Role: ${roleName}`);
    roleCache[roleName] = id;
    return id;
}

async function ensureUser(name, email, roleName, site, deptName, passwordHash) {
    // Get IDs
    const roleId = await ensureRole(roleName);
    const deptId = await ensureDepartment(site, deptName);

    // Check User
    const [users] = await db.query('SELECT id FROM User WHERE email = ?', [email]);
    
    if (users.length > 0) {
        // Update
        // Note: keeping existing password if user exists, or force update? 
        // Instructions imply creating users. Let's update role/dept if changed, but maybe not password to avoid locking people out?
        // User asked: "create them ... password should be..." -> implies setting password.
        // Let's UPDATE everything to match the file source of truth.
        await db.query(`
            UPDATE User 
            SET name = ?, roleId = ?, departmentId = ?, password = ?
            WHERE id = ?
        `, [name, roleId, deptId, passwordHash, users[0].id]);
        // console.log(`   Updated User: ${email}`);
    } else {
        // Insert
        const id = uuidv4();
        await db.query(`
            INSERT INTO User (id, name, email, password, roleId, departmentId, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Active')
        `, [id, name, email, passwordHash, roleId, deptId]);
        console.log(`   Created User: ${email}`);
    }
}

importData();
