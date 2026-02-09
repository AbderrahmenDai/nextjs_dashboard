const db = require('../config/db');

async function addDepartmentToRole() {
    console.log('🔄 Adding departmentId column to Role table...');
    try {
        const [columns] = await db.query("SHOW COLUMNS FROM Role LIKE 'departmentId'");
        if (columns.length === 0) {
            await db.query("ALTER TABLE Role ADD COLUMN departmentId VARCHAR(191)");
            console.log('✅ departmentId column added successfully.');
            
            // Add FK
            try {
                await db.query("ALTER TABLE Role ADD CONSTRAINT fk_role_department FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE CASCADE");
                console.log('✅ Foreign Key constraint added.');
            } catch (err) {
                console.warn('⚠️  Could not add FK (maybe data mismatch?):', err.message);
            }
        } else {
            console.log('ℹ️  departmentId column already exists.');
        }
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding column:', error);
        process.exit(1);
    }
}

addDepartmentToRole();
