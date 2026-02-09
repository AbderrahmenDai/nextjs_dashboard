const db = require('../config/db');
const notificationService = require('../services/notificationService');
const socketService = require('../services/socketService');

async function testNotification() {
    try {
        console.log('🚀 Sending Test Notification to Responsable RH...');
        
        // 1. Find Responsable RH
        const [users] = await db.query(`
            SELECT User.id, User.name, Role.name as roleName 
            FROM User 
            JOIN Role ON User.roleId = Role.id 
            WHERE Role.name LIKE 'Responsable RH%'
        `);
        
        const target = users.find(u => u.roleName.trim() === 'Responsable RH');
        
        if (!target) {
            console.error('❌ Could not find "Responsable RH". Found:', users);
            process.exit(1);
        }

        console.log(`✅ Found Target: ${target.name} (ID: ${target.id})`);

        // 2. Send Notification
        const notification = await notificationService.createNotification({
            senderId: target.id, // Sending to self for test, or use system/admin ID
            receiverId: target.id,
            message: `🔔 TEST NOTIFICATION: System check at ${new Date().toLocaleTimeString()}`,
            type: 'INFO',
            entityType: 'SYSTEM_TEST',
            entityId: 'test-123'
        });
        
        // 3. Emit Socket event (mocking it since we can't easily hook into running socket instance from script)
        // Ideally this script runs within the context of the app or we assume the app handles polling/fetching.
        // But since this is a standalone script, it only inserts into DB.
        // The React app should pick it up on refresh or polling.
        
        console.log('✅ Notification created in DB.');
        console.log('User should see it on next refresh.');
        
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed:', e);
        process.exit(1);
    }
}

testNotification();
