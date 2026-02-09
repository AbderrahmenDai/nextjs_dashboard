const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const TT_DEMANDEURS = [
    { email: 'meher.hammami@tescagroup.com', name: 'Meher Hammami' },
    { email: 'abdelfatteh.mahmoud@tescagroup.com', name: 'Abdelfatteh Mahmoud' },
    { email: 'zouhair.chmissi@tescagroup.com', name: 'Zouhair Chmissi' },
    { email: 'hssan.daghfous@tescagroup.com', name: 'Hssan Daghfous' },
    { email: 'walid.trabelsi@tescagroup.com', name: 'Walid Trabelsi' },
    { email: 'maher.farhani@tescagroup.com', name: 'Maher Farhani' },
    { email: 'imen.benaicha@tescagroup.com', name: 'Imen Benaicha' },
    { email: 'chokri.ghalioun@tescagroup.com', name: 'Chokri Ghalioun', deptHint: 'Finance' },
    { email: 'ines.chaarabi@tescagroup.com', name: 'Ines Chaarabi' },
    { email: 'ahmed.amor@tescagroup.com', name: 'Ahmed Amor', deptHint: 'Finance' },
    { email: 'kais.fakhet@tescagroup.com', name: 'Kais Fakhet' }, // Fixed .co -> .com
    { email: 'rami.ouafi@tescagroup.com', name: 'Rami Ouafi' },
    { email: 'mouna.touati@tescagroup.com', name: 'Mouna Touati' },
    { email: 'tarek.ferchichi@tescagroup.com', name: 'Tarek Ferchichi', deptHint: 'Achat' },
    { email: 'wsaiidi@tescagroup.com', name: 'W. Saiidi' }
];

const DEMANDEUR_ROLE_ID = 'd8d2f46b-af3f-4c84-aaa6-8aeb6378104f'; // From DB check

async function seedTTUsers() {
    console.log('🔄 Seeding TT Demandeur Users...');
    try {
        const hashedPassword = await bcrypt.hash('123', 10);
        
        // 1. Fetch TT Departments
        const [depts] = await db.query("SELECT id, name FROM Department WHERE siteId = 'TT'");
        const deptMap = {};
        depts.forEach(d => deptMap[d.name] = d.id);
        
        // Fallback department
        const defaultDeptId = deptMap['Production'] || depts[0]?.id;
        
        if (!defaultDeptId) {
             console.error("❌ No departments found for Site TT! Cannot seed users.");
             process.exit(1);
        }

        for (const user of TT_DEMANDEURS) {
            // Determine Department
            let deptId = defaultDeptId;
            if (user.deptHint && deptMap[user.deptHint]) {
                deptId = deptMap[user.deptHint];
            } else if (user.deptHint === 'Achat') {
                // If Achat doesn't exist in TT, check if we should create it or use Supply Chain?
                // For now, let's use Production/Default if Achat missing.
                // Or maybe 'Supply Chain' if available?
                if (deptMap['Supply Chain']) deptId = deptMap['Supply Chain'];
            }

            // Check if user exists
            const [existing] = await db.query("SELECT id FROM User WHERE email = ?", [user.email]);
            
            if (existing.length > 0) {
                // Update existing user: Role -> Demandeur, Dept -> TT Dept
                await db.query(
                    "UPDATE User SET roleId = ?, departmentId = ?, jobTitle = ? WHERE id = ?",
                    [DEMANDEUR_ROLE_ID, deptId, 'Demandeur', existing[0].id]
                );
                console.log(`   ✏️  Updated ${user.name} (${user.email}) -> Role: DEMANDEUR, Dept: ${deptId} (TT)`);
            } else {
                // Create new user
                await db.query(
                    `INSERT INTO User (id, name, email, password, roleId, status, departmentId, jobTitle)
                     VALUES (UUID(), ?, ?, ?, ?, 'Active', ?, 'Demandeur')`,
                    [user.name, user.email, hashedPassword, DEMANDEUR_ROLE_ID, deptId]
                );
                console.log(`   ➕ Created ${user.name} (${user.email})`);
            }
        }
        
        console.log('✅ TT Demandeur seeding complete.');
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

seedTTUsers();
