const db = require('./config/db');

async function addCvPathColumn() {
    try {
        console.log('🔧 AJOUT DE LA COLONNE cvPath\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // Check if column exists
        const [columns] = await db.query(`
            SHOW COLUMNS FROM Candidature LIKE 'cvPath'
        `);

        if (columns.length > 0) {
            console.log('✅ La colonne cvPath existe déjà\n');
            process.exit(0);
        }

        console.log('📝 Ajout de la colonne cvPath...\n');

        await db.query(`
            ALTER TABLE Candidature
            ADD COLUMN cvPath VARCHAR(500) NULL
        `);

        console.log('✅ Colonne cvPath ajoutée avec succès !\n');

        // Verify
        const [newColumns] = await db.query(`
            SHOW COLUMNS FROM Candidature LIKE 'cvPath'
        `);

        if (newColumns.length > 0) {
            console.log('✅ Vérification: Colonne trouvée\n');
            console.log('📊 Détails:\n');
            console.log(`   Nom: ${newColumns[0].Field}`);
            console.log(`   Type: ${newColumns[0].Type}`);
            console.log(`   NULL: ${newColumns[0].Null}`);
            console.log(`   Default: ${newColumns[0].Default || 'NULL'}\n`);
        }

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ MIGRATION TERMINÉE !\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

addCvPathColumn();
