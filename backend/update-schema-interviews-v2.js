const db = require('./config/db');

async function updateSchemaInterviewsV2() {
    console.log('🔄 Updating Schema for Interviews (v2)...');
    try {
        // Add "type" column
        try {
            await db.query(`ALTER TABLE Interview ADD COLUMN type VARCHAR(50) DEFAULT 'RH' AFTER date`);
            console.log('✅ Added type column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding type:', e);
            else console.log('ℹ️ type column already exists.');
        }

        // Add "result" column
        try {
            await db.query(`ALTER TABLE Interview ADD COLUMN result VARCHAR(50) DEFAULT 'Pending' AFTER status`);
            console.log('✅ Added result column.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding result:', e);
            else console.log('ℹ️ result column already exists.');
        }
        
        console.log('✅ Interview schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchemaInterviewsV2();
