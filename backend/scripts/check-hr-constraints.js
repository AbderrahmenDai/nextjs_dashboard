const db = require('../config/db');

async function checkConstraints() {
    try {
        console.log("Checking HiringRequest FKs...");
        const [fks] = await db.query(`
            SELECT 
                CONSTRAINT_NAME, 
                COLUMN_NAME, 
                REFERENCED_TABLE_NAME, 
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'HiringRequest' AND TABLE_SCHEMA = 'recruitment_db'
        `);
        
        fks.forEach(fk => {
            console.log(`FK: ${fk.CONSTRAINT_NAME} (${fk.COLUMN_NAME}) -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`);
        });
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

checkConstraints();
