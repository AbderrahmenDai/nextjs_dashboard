const db = require('./config/db');

async function updateSchema() {
    console.log('🔄 Adding cvPath column to Candidature table...');
    try {
        const sql = `
            ALTER TABLE Candidature
            ADD COLUMN cvPath VARCHAR(255) DEFAULT NULL;
        `;

        await db.query(sql);
        console.log('✅ cvPath column added successfully.');
        process.exit(0);
    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('⚠️ cvPath column already exists.');
            process.exit(0);
        }
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchema();
