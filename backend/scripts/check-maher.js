const db = require('../config/db');

async function checkMaher() {
    try {
        const [users] = await db.query("SELECT id, name, email, roleId FROM User WHERE name LIKE '%Maher%' OR email LIKE '%maher%'");
        console.log(`Found ${users.length} users matching 'Maher':`);
        for (const u of users) {
             const [role] = await db.query("SELECT name FROM Role WHERE id = ?", [u.roleId]);
             const roleName = role.length > 0 ? role[0].name : 'Unknown';
             console.log(` - ${u.name} (${u.email}) | ID: ${u.id} | Role: ${roleName} (${u.roleId})`);
        }
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkMaher();
