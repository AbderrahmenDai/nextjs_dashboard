const db = require('../config/db');

async function listRoles() {
    try {
        console.log('🔍 Listing Roles...');
        const [rows] = await db.query('SELECT * FROM Role');
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to list roles:', e);
        process.exit(1);
    }
}

listRoles();
