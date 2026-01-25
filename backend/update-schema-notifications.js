const db = require('./config/db');

async function updateSchema() {
    console.log('🔄 Creating Notification table...');
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS Notification (
                id VARCHAR(50) PRIMARY KEY,
                senderId VARCHAR(50) NOT NULL,
                receiverId VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                isRead BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE CASCADE,
                FOREIGN KEY (receiverId) REFERENCES User(id) ON DELETE CASCADE,
                INDEX idx_receiver (receiverId),
                INDEX idx_created (createdAt)
            );
        `;
        await db.query(sql);
        console.log('✅ Notification table created.');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchema();
