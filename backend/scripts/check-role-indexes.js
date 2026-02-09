const db = require('../config/db');

async function checkRoleIndexes() {
    try {
        const [rows] = await db.query("SHOW INDEX FROM Role");
        console.log(rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkRoleIndexes();
