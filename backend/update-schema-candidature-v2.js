const db = require('./config/db');

async function updateSchemaCandidatureV2() {
    console.log('🔄 Updating Schema for Candidature (v2)...');
    try {
        // Add technicalOpinion
        try {
            await db.query(`ALTER TABLE Candidature ADD COLUMN technicalOpinion TEXT AFTER managerOpinion`);
            console.log('✅ Added technicalOpinion.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding technicalOpinion:', e);
            else console.log('ℹ️ technicalOpinion already exists.');
        }

        // Add validationOpinion
        try {
            await db.query(`ALTER TABLE Candidature ADD COLUMN validationOpinion TEXT AFTER technicalOpinion`);
            console.log('✅ Added validationOpinion.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding validationOpinion:', e);
            else console.log('ℹ️ validationOpinion already exists.');
        }

        // Add finalDecision
        try {
            await db.query(`ALTER TABLE Candidature ADD COLUMN finalDecision VARCHAR(50) DEFAULT 'Pending' AFTER status`);
            console.log('✅ Added finalDecision.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding finalDecision:', e);
            else console.log('ℹ️ finalDecision already exists.');
        }

        // Add hasInterview (stats)
        try {
            await db.query(`ALTER TABLE Candidature ADD COLUMN hasInterview BOOLEAN DEFAULT FALSE`);
            console.log('✅ Added hasInterview.');
        } catch (e) {
            if (e.code !== 'ER_DUP_FIELDNAME') console.error('Error adding hasInterview:', e);
            else console.log('ℹ️ hasInterview already exists.');
        }
        
        console.log('✅ Candidature schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchemaCandidatureV2();
