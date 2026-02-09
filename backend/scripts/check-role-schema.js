const db = require('../config/db');

async function checkRoleSchema() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM Role");
        console.log(rows.filter(r => r.Null === 'NO' && r.Default === null));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkRoleSchema();
