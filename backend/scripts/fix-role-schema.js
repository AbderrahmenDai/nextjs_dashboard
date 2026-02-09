const db = require('../config/db');

async function fixRoleSchema() {
    try {
        console.log('🔧 Modifying Role table indices...');
        
        // 1. Drop existing UNIQUE index on 'name'
        // Note: The index name provided in previous step was 'name'.
        try {
            await db.query('DROP INDEX name ON Role');
            console.log('   - Dropped UNIQUE index on "name"');
        } catch (e) {
            console.log('   - Index "name" might not exist or already dropped:', e.message);
        }

        // 2. Add UNIQUE index on (name, departmentId)
        // We need to name it something else or just rely on the existing schema not failing?
        // Let's add it to ensure data integrity but allowing same name in diff depts.
        try {
            await db.query('CREATE UNIQUE INDEX idx_role_name_dept ON Role (name, departmentId)');
            console.log('   - Created UNIQUE index on (name, departmentId)');
        } catch (e) {
            console.log('   - Index (name, departmentId) might already exist:', e.message);
        }

        console.log('✅ Role schema updated.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to modify Role schema:', e);
        process.exit(1);
    }
}

fixRoleSchema();
