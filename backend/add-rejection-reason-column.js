const db = require('./config/db');

async function addRejectionReasonColumn() {
    try {
        console.log('Adding rejectionReason column to HiringRequest table...');
        
        // Add the column without IF NOT EXISTS (better compatibility)
        // If it fails with code 1060 (Duplicate column), we ignore it.
        try {
            await db.query(`
                ALTER TABLE HiringRequest 
                ADD COLUMN rejectionReason TEXT
            `);
            console.log('✅ Successfully added rejectionReason column!');
        } catch (innerError) {
            if (innerError.code === 'ER_DUP_FIELDNAME' || innerError.errno === 1060) {
                console.log('ℹ️ Column rejectionReason already exists. Skipping.');
            } else {
                throw innerError;
            }
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addRejectionReasonColumn();
