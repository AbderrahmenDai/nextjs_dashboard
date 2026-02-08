const db = require('./config/db');
async function check() {
    const [rows] = await db.query("SELECT name, jobTitle FROM User WHERE departmentId IN (SELECT id FROM Department WHERE siteId = 'TTG') LIMIT 10");
    console.log(rows);
    process.exit(0);
}
check();
