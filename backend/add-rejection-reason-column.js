const db = require('./config/db');

async function addRejectionReasonColumn() {
    try {
        console.log('Adding rejectionReason column to HiringRequest table...');
        
        // Add the column
        await db.query(`
            ALTER TABLE HiringRequest 
            ADD COLUMN IF NOT EXISTS rejectionReason TEXT
        `);
        
        console.log('✅ Successfully added rejectionReason column!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addRejectionReasonColumn();
