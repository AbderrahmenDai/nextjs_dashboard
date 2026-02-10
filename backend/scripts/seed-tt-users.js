
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const SITE_NAME = "TT";

// Mapping of specific roles to real people (from previous context)
const REAL_USERS = [
    { title: 'Plant Manager', name: 'Mohamed-Aymen Baccouche', email: 'mohamed-aymen.baccouche@tescagroup.com', dept: 'Direction' },
    { title: 'Directeur RH', name: 'Amine Elabed', email: 'amine.elabed@tescagroup.com', dept: 'Ressources Humaines' }, // Reusing HRBP name for Directeur RH for now as he is senior
    { title: 'Responsable HSE', name: 'Responsable HSE', email: 'hse@tescagroup.com', dept: 'HSE' },
    { title: 'Responsable Achat', name: 'Tarek Ferchichi', email: 'tarek.ferchichi@tescagroup.com', dept: 'Achat' },
    { title: 'Responsable Finance', name: 'Chokri Ghalioun', email: 'chokri.ghalioun@tescagroup.com', dept: 'Finance' },
    { title: 'Responsable Qualité', name: 'Mohamed-Karim Tabassi', email: 'mohamed-karim.tabassi@tescagroup.com', dept: 'Qualité' },
    { title: 'Responsable Production', name: 'Kais Riahi', email: 'kais.riahi@tescagroup.com', dept: 'Production' }, // Previously Supply Chain, now Production
    { title: 'Responsable Supply Chain', name: 'Khaled Dridi', email: 'khaled.dridi@tescagroup.com', dept: 'Supply Chain' },
    { title: 'Chef d\'équipe', name: 'Abderrahmen', email: 'abderrahmen@tesca.com', dept: 'Production' } // The main user
];

const SYSTEM_ROLES = ['Admin', 'DEMANDEUR'];

async function seedUsers() {
    try {
        console.log("🌱 Seeding Users for TT Site...");
        const hashedPassword = await bcrypt.hash('123', 10);

        // 1. Ensure System Roles exist
        const systemRoleIds = {};
        for (const rName of SYSTEM_ROLES) {
            let [roles] = await db.query('SELECT id FROM Role WHERE name = ?', [rName]);
            if (roles.length === 0) {
                const newId = uuidv4();
                await db.query('INSERT INTO Role (id, name, description) VALUES (?, ?, ?)', [newId, rName, 'System Role']);
                systemRoleIds[rName] = newId;
                console.log(`Created System Role: ${rName}`);
            } else {
                systemRoleIds[rName] = roles[0].id;
            }
        }

        // 2. Get TT Departments
        const [departments] = await db.query('SELECT id, name FROM Department WHERE siteId = ?', [SITE_NAME]);
        const deptMap = {}; // Name -> ID
        departments.forEach(d => deptMap[d.name] = d.id);

        // 3. Process Real Users
        for (const user of REAL_USERS) {
            // Find Department
            const deptId = deptMap[user.dept];
            if (!deptId) {
                console.log(`⚠️ Dept '${user.dept}' not found for ${user.name}.`);
                continue;
            }

            // Find Role ID
            // Try to find the exact role title in DB
            let [roles] = await db.query('SELECT id FROM Role WHERE name = ?', [user.title]);
            let roleId;
            
            if (roles.length > 0) {
                roleId = roles[0].id;
            } else {
                // If role title doesn't exist as a Role, fallback to 'DEMANDEUR' or create it?
                // For 'Chef d\'équipe', it might not exist in my seeded structure.
                // If Abderrahmen is DEMANDEUR, assign DEMANDEUR role.
                if (user.title === "Chef d'équipe") {
                    roleId = systemRoleIds['DEMANDEUR'];
                } else {
                    // Create the role on the fly if missing?
                    console.log(`⚠️ Role '${user.title}' not found. Creating it linked to ${user.dept}...`);
                    roleId = uuidv4();
                    await db.query('INSERT INTO Role (id, name, departmentId) VALUES (?, ?, ?)', [roleId, user.title, deptId]);
                }
            }

            // Create/Update User
            const [existing] = await db.query('SELECT id FROM User WHERE email = ?', [user.email]);
            if (existing.length === 0) {
                await db.query(`
                    INSERT INTO User (id, name, email, password, roleId, status, departmentId, post, avatarGradient)
                    VALUES (UUID(), ?, ?, ?, ?, 'Active', ?, ?, 'from-blue-500 to-cyan-500')
                `, [user.name, user.email, hashedPassword, roleId, deptId, user.title]);
                console.log(`Created User: ${user.name} (${user.title})`);
            } else {
                // Update existing
                await db.query(`
                    UPDATE User SET roleId = ?, departmentId = ?, post = ? WHERE id = ?
                `, [roleId, deptId, user.title, existing[0].id]);
                console.log(`Updated User: ${user.name}`);
            }
        }

        // 4. Create an Admin User if not exists
        const [admin] = await db.query('SELECT id FROM User WHERE email = ?', ['admin@tesca.com']);
        if (admin.length === 0) {
            await db.query(`
                INSERT INTO User (id, name, email, password, roleId, status, avatarGradient)
                VALUES (UUID(), 'Admin System', 'admin@tesca.com', ?, ?, 'Active', 'from-purple-500 to-pink-500')
            `, [hashedPassword, systemRoleIds['Admin']]);
            console.log("Created Admin User");
        }

        console.log("✅ User Seeding Complete.");

    } catch (e) {
        console.error("Error seeding users:", e);
    } finally {
        process.exit();
    }
}

seedUsers();
