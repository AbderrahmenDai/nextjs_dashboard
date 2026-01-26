const db = require('./config/db');

async function createTable() {
    try {
        console.log('Creating Notification table...');
        await db.query(`
            CREATE TABLE IF NOT EXISTS Notification (
                id VARCHAR(36) PRIMARY KEY,
                senderId VARCHAR(36),
                receiverId VARCHAR(36),
                message TEXT,
                isRead BOOLEAN DEFAULT FALSE,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE SET NULL,
                FOREIGN KEY (receiverId) REFERENCES User(id) ON DELETE CASCADE
            )
        `);
        console.log('Notification table created successfully');
    } catch (err) {
        console.error('Error creating table:', err);
    }
    process.exit();
}

createTable();
