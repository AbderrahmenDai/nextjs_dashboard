const db = require('../config/db');

async function checkSchema() {
    try {
        const [rows] = await db.query("SHOW COLUMNS FROM Department LIKE 'head'");
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkSchema();
