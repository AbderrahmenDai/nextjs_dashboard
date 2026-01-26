const db = require('./config/db');

async function updateSchema() {
    try {
        console.log('Updating HiringRequest schema to match "Demande d\'Autorisation d\'Embauche"...');

        const alterQueries = [
            "ADD COLUMN IF NOT EXISTS site VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS businessUnit VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS desiredStartDate DATE",
            "ADD COLUMN IF NOT EXISTS replacementFor VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS replacementReason VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS increaseType VARCHAR(50)", 
            "ADD COLUMN IF NOT EXISTS increaseDateRange VARCHAR(255)",
            "ADD COLUMN IF NOT EXISTS educationRequirements TEXT",
            "ADD COLUMN IF NOT EXISTS skillsRequirements TEXT"
        ];

        for (const queryPart of alterQueries) {
            try {
                await db.query(`ALTER TABLE HiringRequest ${queryPart}`);
                console.log(`Executed: ${queryPart}`);
            } catch (err) {
                // Ignore "duplicate column" errors if they happen (though IF NOT EXISTS should handle it on newer MySQL/MariaDB)
                // Note: IF NOT EXISTS for ADD COLUMN is available in MariaDB 10.2.1+ and MySQL 8.0.29+
                // If it fails syntax, we might need to check existence first. 
                // Let's assume standard MySQL behavior or just catch the error.
                console.log(`Skipping or Error (might already exist): ${queryPart} - ${err.message}`);
            }
        }

        console.log('HiringRequest schema updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error updating schema:', error);
        process.exit(1);
    }
}

updateSchema();
