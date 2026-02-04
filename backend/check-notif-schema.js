const db = require('./config/db');

async function checkNotificationSchema() {
    console.log('🔍 Checking Notification table schema...');
    try {
        const [columns] = await db.query('SHOW COLUMNS FROM Notification');
        console.log(JSON.stringify(columns, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkNotificationSchema();
