const db = require('../config/db');

async function addJobTitleColumn() {
    console.log('🔄 Adding jobTitle column to User table...');
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM User LIKE 'jobTitle'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE User ADD COLUMN jobTitle VARCHAR(255)");
            console.log('✅ jobTitle column added successfully.');
        } else {
            console.log('ℹ️  jobTitle column already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addJobTitleColumn();
