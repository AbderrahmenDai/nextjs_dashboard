const db = require('../config/db');

async function debugRecentNotifications() {
    try {
        console.log('🔍 Debugging Recent Notifications...');
        
        // 1. Get last 5 Hiring Requests to see their status and creator
        const [requests] = await db.query(`
            SELECT id, title, status, requesterId, createdAt 
            FROM HiringRequest 
            ORDER BY createdAt DESC 
            LIMIT 5
        `);
        console.log('--- Last 5 Hiring Requests ---');
        console.log(requests);

        // 2. Get last 10 Notifications
        const [notifications] = await db.query(`
            SELECT n.id, n.message, n.receiverId, r.name as receiverName, n.createdAt 
            FROM Notification n
            LEFT JOIN User r ON n.receiverId = r.id
            ORDER BY n.createdAt DESC 
            LIMIT 10
        `);
        console.log('\n--- Last 10 Notifications ---');
        console.log(notifications);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugRecentNotifications();
