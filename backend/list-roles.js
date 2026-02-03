const db = require('./config/db');

async function listRoles() {
    try {
        const [roles] = await db.query('SELECT * FROM Role ORDER BY name');
        console.log(JSON.stringify(roles, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

listRoles();
