const db = require('./config/db');

async function checkConnection() {
    console.log("Testing Simple MySQL Connection...");
    try {
        const [rows] = await db.query('SELECT 1 as val');
        console.log("✅ Connection Successful! Value:", rows[0].val);
        
        // Check if User table exists
        try {
            const [users] = await db.query('SELECT count(*) as count FROM User');
            console.log(`✅ Table 'User' exists. Count: ${users[0].count}`);
        } catch (e) {
            console.error("❌ Table 'User' query failed:", e.message);
        }

    } catch (error) {
        console.error("❌ Connection Failed:", error.message);
        console.error("Error Code:", error.code);
        console.error("Error No:", error.errno);
    } finally {
        process.exit();
    }
}

checkConnection();
