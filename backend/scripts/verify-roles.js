const db = require('../config/db');

async function listUserRoles() {
    try {
        const [users] = await db.query(`
            SELECT u.name, u.email, r.name as roleName, u.roleId 
            FROM User u 
            LEFT JOIN Role r ON u.roleId = r.id
            WHERE u.email LIKE '%tescagroup.com%'
            ORDER BY u.name
        `);
        
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(` - ${u.name} (${u.email}) -> Role: ${u.roleName} [${u.roleId}]`);
        });
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

listUserRoles();
