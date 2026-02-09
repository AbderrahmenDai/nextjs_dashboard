const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const TTG_STRUCTURE = {
    'Ressources Humaines': [
        'Directeur RH',
        'Responsable Communication et Formation',
        'Responsable développement et recrutement',
        'HRBP',
        'Responsable Paie',
        'Chargé RH & HSE',
        'Chargé Formation et juridique'
    ],
    'HSE': [
        'Responsable HSE',
        'Superviseur HSE',
        'Aide Soignant',
        'Infirmier'
    ],
    'Achat': [
        'Directeur Achat',
        'Acheteur Senior',
        'Acheteur Junior'
    ],
    'Finance': [
        'Responsable Comptabilité',
        'Responsable Finance',
        'Comptable Senior',
        'Assistant Controleur de Gestion',
        'Controleur de Gestion',
        'Assistant Responsable Cash',
        'Responsable Cash',
        'Comptable Junior'
    ],
    'Supply Chain': [
        'Responsable Supply Chain',
        'Responsable Approvisionnement', // Corrected "Responsable Aprov"
        'Responsable Planification & Contact Client',
        'PIC-PDP',
        'Responsable Flux & Magasin',
        'Planificateur et Contact Client', // Corrected "Planifiacteur"
        'Planificateur Prod',
        'Approvisionneur',
        'Superviseur Magasin'
    ],
    'Qualité': [
        'Ingénieur Qualité Prod', // Expanded "Ing"
        'Responsable Labo',
        'Responsable AQF'
    ],
    'Production': [
        'Responsable Manufacturing & Supply Chain',
        'Responsable UAP',
        'Responsable UAP Tissage',
        'Responsable UAP Finition',
        'Superviseur Tissage',
        'Superviseur Finition'
    ],
    'Indus & Amélioration Continue': [
        'Responsable Engineering',
        'Chef Projet & Amélioration Continue'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

// Map old names to new names if renaming is needed
const DEPT_RENAMES = {
    'Finace': 'Finance',
    'Ressources Huamine': 'Ressources Humaines',
    'Méthode & Indus': 'Indus & Amélioration Continue',
    'Engineering': 'Indus & Amélioration Continue' // Merge if needed
};

async function updateTTGStructure() {
    console.log('🔄 Updating TTG Structure based on Image...');

    try {
        const hashedPassword = await bcrypt.hash('123456', 10);

        // 0. Get Roles Map
        const [roles] = await db.query('SELECT id, name FROM Role');
        const roleMap = {};
        roles.forEach(r => roleMap[r.name] = r.id);
        console.log('   ℹ️  Roles loaded:', Object.keys(roleMap));

        // 1. Ensure Site exists
        await db.query(`INSERT IGNORE INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)`, 
            ['TTG', 'TTG', 3500000.00, 'Global Distribution Center']
        );

        // 2. Handle Department Renaming
        for (const [oldName, newName] of Object.entries(DEPT_RENAMES)) {
            const [check] = await db.query('SELECT id FROM Department WHERE name = ? AND siteId = ?', [oldName, 'TTG']);
            if (check.length > 0) {
                console.log(`   ✏️ Renaming Department '${oldName}' to '${newName}'...`);
                await db.query('UPDATE Department SET name = ? WHERE id = ?', [newName, check[0].id]);
            }
        }

        // 3. Sync Departments and Posts
        for (const [deptName, jobTitles] of Object.entries(TTG_STRUCTURE)) {
            // A. Get/Create Department
            let [deptRows] = await db.query('SELECT id FROM Department WHERE name = ? AND siteId = ?', [deptName, 'TTG']);
            
            let deptId;
            if (deptRows.length > 0) {
                deptId = deptRows[0].id;
                // console.log(`   - Dept '${deptName}' found.`);
            } else {
                deptId = uuidv4();
                await db.query(
                    `INSERT INTO Department (id, name, head, location, employeeCount, budget, status, siteId) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [deptId, deptName, 'TBD', 'TTG Main', 0, 0, 'Active', 'TTG']
                );
                console.log(`   + Created Dept '${deptName}'`);
            }

            // B. Ensure Job Titles Exist (as Users)
            for (const title of jobTitles) {
                // Check if ANY user exists with this jobTitle in this department
                const [userRows] = await db.query(
                    'SELECT id FROM User WHERE departmentId = ? AND jobTitle = ?', 
                    [deptId, title]
                );

                if (userRows.length === 0) {
                    // Create Placeholder User
                    const sanitized = title.toLowerCase().replace(/[^a-z0-9]/g, '.');
                    const email = `${sanitized}.ttg@tescagroup.com`;
                    const name = `${title}`;

                    // Determine Role Name
                    let roleName = 'EMPLOYEE';
                    const t = title.toLowerCase();
                    if (t.includes('directeur') || t.includes('plant manager')) roleName = 'ADMIN'; 
                    else if (t.includes('responsable') || t.includes('chef') || t.includes('manager')) roleName = 'HR_MANAGER'; 
                    else if (t.includes('rh')) roleName = 'DEMANDEUR'; // Usually HR people are Demandeurs or Recruteurs

                    // Fallback to Employee if role not found in map (though we seeded them)
                    let roleId = roleMap[roleName] || roleMap['EMPLOYEE'];

                    console.log(`   + Adding Post: ${title} (Role: ${roleName})`);
                    await db.query(
                        `INSERT INTO User (id, name, email, password, roleId, status, departmentId, jobTitle)
                         VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
                        [name, email, hashedPassword, roleId, 'Active', deptId, title]
                    );
                }
            }
        }

        console.log('✅ TTG Structure Update Complete.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error updating structure:', err);
        process.exit(1);
    }
}

updateTTGStructure();
