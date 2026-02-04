const db = require('./config/db');

async function updateSchema() {
    console.log('🔄 Updating database schema for Time to Fill...');
    
    try {
        // 1. Ajouter les colonnes à HiringRequest
        console.log('--- Updating HiringRequest ---');
        try {
            await db.query(`ALTER TABLE HiringRequest ADD COLUMN approvedAt DATETIME DEFAULT NULL`);
            console.log('✅ Added approvedAt to HiringRequest');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding approvedAt:', e.message);
            else console.log('ℹ️ approvedAt already exists');
        }

        try {
            await db.query(`ALTER TABLE HiringRequest ADD COLUMN approvedById VARCHAR(50) DEFAULT NULL`);
            console.log('✅ Added approvedById to HiringRequest');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding approvedById:', e.message);
            else console.log('ℹ️ approvedById already exists');
        }

        // 2. Ajouter la colonne à Candidature
        console.log('\n--- Updating Candidature ---');
        try {
            await db.query(`ALTER TABLE Candidature ADD COLUMN hireDate DATETIME DEFAULT NULL`);
            console.log('✅ Added hireDate to Candidature');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding hireDate:', e.message);
            else console.log('ℹ️ hireDate already exists');
        }

        console.log('\n✅ Schema update completed successfully.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Schema update failed:', error);
        process.exit(1);
    }
}

updateSchema();
