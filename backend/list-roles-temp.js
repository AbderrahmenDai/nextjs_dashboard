const db = require('./config/db');

async function listRoles() {
    try {
        const [roles] = await db.query('SELECT * FROM Role');
        console.log('Roles:', roles);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listRoles();
