const db = require('./config/db');

async function cleanup() {
    try {
        const [result] = await db.query("DELETE FROM User WHERE name LIKE 'User%'");
        console.log(`Successfully deleted ${result.affectedRows} users starting with 'User'`);
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
