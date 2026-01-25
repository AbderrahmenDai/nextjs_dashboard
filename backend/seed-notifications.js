const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedNotifications() {
    console.log('🌱 Seeding Notifications...');

    try {
        // 1. Get all users
        const [users] = await db.query('SELECT id, name FROM User');
        
        if (users.length === 0) {
            console.log('⚠️ No users found. Please seed users first.');
            process.exit(1);
        }

        console.log(`Found ${users.length} users. Generating notifications...`);

        const notifications = [];
        const messages = [
            "Your leave request has been approved.",
            "New policy document available for review.",
            "Meeting scheduled: Q4 Planning.",
            "Don't forget to submit your timesheet.",
            "Welcome to the new HR portal!",
            "Your profile was successfully updated.",
            "New candidate application received.",
            "Interview reminder: Tomorrow at 10 AM.",
            "System maintenance scheduled for weekend.",
            "Please update your emergency contact info."
        ];

        // 2. Generate notifications for each user
        for (const user of users) {
             // Assign a random sender (or self if only 1 user)
             const sender = users[Math.floor(Math.random() * users.length)];
             
             // Create at least 7 notifications
             for (let i = 0; i < 8; i++) {
                const message = messages[Math.floor(Math.random() * messages.length)];
                // Random date within last 7 days
                const date = new Date();
                date.setDate(date.getDate() - Math.floor(Math.random() * 7));

                notifications.push([
                    uuidv4(),
                    sender.id,
                    user.id, // receiver
                    message,
                    date,
                    false // isRead
                ]);
             }
        }

        // 3. Batch Insert
        if (notifications.length > 0) {
            const sql = `INSERT INTO Notification (id, senderId, receiverId, message, createdAt, isRead) VALUES ?`;
            await db.query(sql, [notifications]);
            console.log(`✅ Successfully seeded ${notifications.length} notifications.`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to seed notifications:', error);
        process.exit(1);
    }
}

seedNotifications();
