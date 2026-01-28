const db = require('./config/db');

async function updateNotificationSchema() {
    try {
        console.log('Checking Notification table schema...');
        
        // Check if columns exist
        const [columns] = await db.query(`SHOW COLUMNS FROM Notification`);
        const columnNames = columns.map(c => c.Field);

        if (!columnNames.includes('type')) {
            console.log('Adding type column...');
            await db.query(`ALTER TABLE Notification ADD COLUMN type VARCHAR(50) DEFAULT 'INFO'`);
        }

        if (!columnNames.includes('entityType')) {
            console.log('Adding entityType column...');
            await db.query(`ALTER TABLE Notification ADD COLUMN entityType VARCHAR(50) NULL`);
        }

        if (!columnNames.includes('entityId')) {
            console.log('Adding entityId column...');
            await db.query(`ALTER TABLE Notification ADD COLUMN entityId VARCHAR(36) NULL`);
        }

        if (!columnNames.includes('actions')) {
            console.log('Adding actions column...');
            await db.query(`ALTER TABLE Notification ADD COLUMN actions JSON NULL`);
        }

        console.log('Notification schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateNotificationSchema();
