const db = require('../config/db');

async function listUsers() {
    console.log('Fetching users...');
    try {
        const [users] = await db.query('SELECT id, name, email, roleId FROM User');
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(` - [${u.id}] ${u.name} (${u.email})`);
        });
        process.exit(0);
    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
}

listUsers();
