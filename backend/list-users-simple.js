const db = require('./config/db');

async function listAllUsers() {
    try {
        const [users] = await db.query(`
            SELECT User.name, User.email, Role.name as roleName
            FROM User
            LEFT JOIN Role ON User.roleId = Role.id
            ORDER BY Role.name, User.name
        `);
        
        const json = JSON.stringify(users, null, 2);
        console.log(json);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

listAllUsers();
