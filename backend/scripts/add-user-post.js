const db = require('../config/db');

async function addUserPostColumn() {
    try {
        console.log('🔧 Updating User table...');
        
        // Check if column exists
        const [columns] = await db.query("SHOW COLUMNS FROM User LIKE 'post'");
        if (columns.length === 0) {
            await db.query('ALTER TABLE User ADD COLUMN post VARCHAR(255) NULL AFTER departmentId');
            console.log('✅ Added "post" column to User table.');
        } else {
            console.log('🔹 "post" column already exists.');
        }

        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to update User table:', e);
        process.exit(1);
    }
}

addUserPostColumn();
