const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function debugLogin() {
    try {
        console.log("1. Fetching first user...");
        const [users] = await db.query('SELECT * FROM User LIMIT 1');
        
        if (users.length === 0) {
            console.log("❌ No users found in DB.");
            return;
        }
        
        const user = users[0];
        console.log("✅ User found:", user.email);
        console.log("   Role:", user.role);
        console.log("   Hashed Password:", user.password ? "Present" : "Missing");

        if (!user.password) {
            console.error("❌ User has no password (cannot test login)");
            return;
        }

        console.log("2. Simulating bcrypt compare (assuming password '123456' - common seed default)...");
        // Most seeds use '123456'
        const isMatch = await bcrypt.compare('123456', user.password);
        console.log("   Password '123456' match?", isMatch);

        if (!isMatch) {
            console.log("   Trying 'password'...");
            const isMatch2 = await bcrypt.compare('password', user.password);
            console.log("   Password 'password' match?", isMatch2);
        }

        console.log("3. Testing Service Query Structure...");
        const [usersDetailed] = await db.query(`
            SELECT User.*, Department.name as departmentName 
            FROM User 
            LEFT JOIN Department ON User.departmentId = Department.id
            WHERE User.email = ?
        `, [user.email]);
        
        console.log("✅ Detailed Query Success. Result count:", usersDetailed.length);
        if (usersDetailed.length > 0) {
            console.log("   Department:", usersDetailed[0].departmentName);
        }

    } catch (error) {
        console.error("❌ CRASH:", error);
    } finally {
        process.exit();
    }
}

debugLogin();
