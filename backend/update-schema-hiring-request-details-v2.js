const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Retry: Updating HiringRequest schema...');

        const columns = [
            { name: 'site', type: 'VARCHAR(255)' },
            { name: 'businessUnit', type: 'VARCHAR(255)' },
            { name: 'desiredStartDate', type: 'DATE' },
            { name: 'replacementFor', type: 'VARCHAR(255)' },
            { name: 'replacementReason', type: 'VARCHAR(255)' },
            { name: 'increaseType', type: 'VARCHAR(50)' },
            { name: 'increaseDateRange', type: 'VARCHAR(255)' },
            { name: 'educationRequirements', type: 'TEXT' },
            { name: 'skillsRequirements', type: 'TEXT' }
        ];

        for (const col of columns) {
            try {
                await db.query(`ALTER TABLE HiringRequest ADD COLUMN ${col.name} ${col.type}`);
                console.log(`Added column: ${col.name}`);
            } catch (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log(`Column ${col.name} already exists.`);
                } else {
                    console.error(`Error adding ${col.name}:`, err.message);
                }
            }
        }

        console.log('HiringRequest schema check complete.');
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL Error:', error);
        process.exit(1);
    }
}

updateSchema();
