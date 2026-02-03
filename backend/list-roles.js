const db = require('./config/db');
async function run() {
    try {
        const [rows] = await db.query('SELECT * FROM Role');
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}
run();
