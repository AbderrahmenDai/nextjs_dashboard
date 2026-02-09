const db = require('../config/db');

async function fixDepartmentSchema() {
    try {
        console.log('🔧 Modifying Department table to allow NULL for "head"...');
        await db.query('ALTER TABLE Department MODIFY head VARCHAR(255) NULL');
        console.log('✅ Success! "head" column is now NULLable.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to modify schema:', e);
        process.exit(1);
    }
}

fixDepartmentSchema();
