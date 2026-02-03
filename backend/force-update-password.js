const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function forceUpdatePassword() {
    try {
        const email = 'karim.mani@tescagroup.com';
        const newPassword = '123456';
        
        console.log(`🔄 Force updating password for ${email}...`);

        const [users] = await db.query("SELECT id FROM User WHERE email = ?", [email]);

        if (users.length === 0) {
            console.error('❌ User not found!');
            process.exit(1);
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        await db.query("UPDATE User SET password = ? WHERE id = ?", [hashedPassword, users[0].id]);
        
        console.log(`✅ Password successfully updated to '${newPassword}' for user ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating password:', error);
        process.exit(1);
    }
}

forceUpdatePassword();
