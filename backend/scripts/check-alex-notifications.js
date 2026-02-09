const db = require('../config/db');

async function checkNotifications() {
    try {
        console.log('🔍 Checking Notifications for Alex Thompson (Responsable RH)...');
        // ID from previous step: 18a1aee6-ac21-4597-9dce-49d498adf89e
        const userId = '18a1aee6-ac21-4597-9dce-49d498adf89e';

        const [notifications] = await db.query(`
            SELECT * FROM Notification 
            WHERE receiverId = ? 
            ORDER BY createdAt DESC 
            LIMIT 5
        `, [userId]);

        console.log(`Found ${notifications.length} notifications for Alex Thompson:`);
        console.log(notifications);

        console.log('---');
        console.log('🔍 Checking most recent notifications in the entire system (last 5)...');
        const [recent] = await db.query(`
            SELECT n.*, sender.name as senderName, receiver.name as receiverName
            FROM Notification n
            LEFT JOIN User sender ON n.senderId = sender.id
            LEFT JOIN User receiver ON n.receiverId = receiver.id
            ORDER BY n.createdAt DESC
            LIMIT 5
        `);
        console.log(recent);
        
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed:', e);
        process.exit(1);
    }
}

checkNotifications();
