
const db = require('./config/db');

async function addDepartmentIdToRole() {
    try {
        console.log('Adding departmentId column to Role table...');
        try {
            await db.query(`
                ALTER TABLE Role 
                ADD COLUMN departmentId VARCHAR(255),
                ADD CONSTRAINT fk_role_department FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE SET NULL
            `);
            console.log('✅ Successfully added departmentId column!');
        } catch (innerError) {
            if (innerError.code === 'ER_DUP_FIELDNAME' || innerError.errno === 1060) {
                console.log('ℹ️ Column departmentId already exists. Skipping.');
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

addDepartmentIdToRole();
