const db = require('../config/db');

async function fixDates() {
    console.log('🔄 Checking and fixing HiringRequest dates...');
    try {
        // Change columns to allow NULL or DATETIME
        await db.query(`ALTER TABLE HiringRequest MODIFY COLUMN desiredStartDate DATETIME NULL`);
        await db.query(`ALTER TABLE HiringRequest MODIFY COLUMN approvedAt DATETIME NULL`);
        console.log('✅ Adjusted date columns to accept DATETIME NULL.');

        // Verify/Add 'roleId' column if missing (since we saw 'roleId' in the request payload but maybe it's not in DB yet)
        const [roleCheck] = await db.query("SHOW COLUMNS FROM HiringRequest LIKE 'roleId'");
        if (roleCheck.length === 0) {
            await db.query("ALTER TABLE HiringRequest ADD COLUMN roleId VARCHAR(191)");
            console.log('✅ Added roleId column to HiringRequest.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error fixing tables:', error);
        process.exit(1);
    }
}

fixDates();
