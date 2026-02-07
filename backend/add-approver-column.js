const db = require('./config/db');

async function addApproverColumns() {
    console.log('🔄 Checking and adding approver columns to HiringRequest table...');
    
    // Helper function to check if column exists
    async function columnExists(tableName, columnName) {
        const [rows] = await db.query(`
            SELECT count(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = ? 
            AND COLUMN_NAME = ?
        `, [tableName, columnName]);
        return rows[0].count > 0;
    }

    try {
        // 1. Add approverId
        if (await columnExists('HiringRequest', 'approverId')) {
            console.log('ℹ️  Column approverId already exists.');
        } else {
            console.log('➕ Adding approverId column...');
            await db.query(`
                ALTER TABLE HiringRequest 
                ADD COLUMN approverId VARCHAR(50)
            `);
             await db.query(`
                ALTER TABLE HiringRequest
                ADD CONSTRAINT fk_hr_approver FOREIGN KEY (approverId) REFERENCES User(id) ON DELETE SET NULL
            `);
            console.log('✅ Added approverId column and foreign key.');
        }

        // 2. Add approvedAt
        if (await columnExists('HiringRequest', 'approvedAt')) {
            console.log('ℹ️  Column approvedAt already exists.');
        } else {
            console.log('➕ Adding approvedAt column...');
            await db.query(`ALTER TABLE HiringRequest ADD COLUMN approvedAt DATETIME`);
            console.log('✅ Added approvedAt column.');
        }

        // 3. Add rejectionReason
        if (await columnExists('HiringRequest', 'rejectionReason')) {
            console.log('ℹ️  Column rejectionReason already exists.');
        } else {
            console.log('➕ Adding rejectionReason column...');
            await db.query(`ALTER TABLE HiringRequest ADD COLUMN rejectionReason TEXT`);
            console.log('✅ Added rejectionReason column.');
        }

        console.log('🎉 Schema update complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

addApproverColumns();
