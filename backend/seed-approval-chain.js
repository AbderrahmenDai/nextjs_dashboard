const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedApprovalChain() {
    try {
        console.log('🔗 Seeding Approval Chain Users & Roles...');

        // 1. Roles to Ensure
        const rolesToEnsure = [
            { name: 'HR_MANAGER', label: 'R.RH' },
            { name: 'RECRUITMENT_MANAGER', label: 'Responsable Recrutement' },
            { name: 'PLANT_MANAGER', label: 'Direction' } // Already exists, but good to double check
        ];

        const roleMap = {};

        for (const roleDef of rolesToEnsure) {
            const [rows] = await db.query("SELECT id FROM Role WHERE name = ?", [roleDef.name]);
            if (rows.length > 0) {
                roleMap[roleDef.name] = rows[0].id;
                console.log(`✅ Role ${roleDef.name} exists.`);
            } else {
                const id = uuidv4();
                await db.query("INSERT INTO Role (id, name) VALUES (?, ?)", [id, roleDef.name]);
                roleMap[roleDef.name] = id;
                console.log(`✅ Role ${roleDef.name} created.`);
            }
        }

        // 2. Users to Ensure
        const usersToSeed = [
            {
                email: 'zoubaier.berrebeh@tescagroup.com',
                name: 'Zoubaier Berrebeh',
                role: 'HR_MANAGER',
                password: '123'
            },
            {
                email: 'hiba.saadani@tescagroup.com',
                name: 'Hiba Saadani',
                role: 'RECRUITMENT_MANAGER',
                password: '123'
            }
            // Karim Mani is already seeded
        ];

        for (const userDef of usersToSeed) {
            const [existing] = await db.query("SELECT id FROM User WHERE email = ?", [userDef.email]);
            const roleId = roleMap[userDef.role];
            const hashedPassword = await bcrypt.hash(userDef.password, 10);
            
            // Get a default department
            const [depts] = await db.query("SELECT id FROM Department LIMIT 1");
            const deptId = depts[0].id;

            if (existing.length > 0) {
                await db.query("UPDATE User SET roleId = ?, password = ? WHERE id = ?", [roleId, hashedPassword, existing[0].id]);
                console.log(`✅ Updated ${userDef.email} to role ${userDef.role}`);
            } else {
                await db.query(`
                    INSERT INTO User (id, name, email, password, roleId, status, avatarGradient, departmentId)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [uuidv4(), userDef.name, userDef.email, hashedPassword, roleId, 'Active', 'from-blue-500 to-indigo-500', deptId]);
                console.log(`✅ Created ${userDef.email} as ${userDef.role}`);
            }
        }
        
        console.log('🎉 Approval chain seeding complete.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding approval chain:', error);
        process.exit(1);
    }
}

seedApprovalChain();
