const db = require('./backend/config/db');

async function cleanup() {
    try {
        const [result] = await db.query("DELETE FROM User WHERE departmentId IS NULL");
        console.log(`Successfully deleted ${result.affectedRows} users with no department assigned.`);
        process.exit(0);
    } catch (error) {
        console.error("Cleanup failed:", error);
        process.exit(1);
    }
}

cleanup();
