const db = require('./config/db');

async function checkGenderColumn() {
    try {
        console.log('🔍 VÉRIFICATION DE LA COLONNE gender\n');
        console.log('═══════════════════════════════════════════════════════\n');

        const [columns] = await db.query(`
            SHOW COLUMNS FROM Candidature WHERE Field = 'gender'
        `);

        if (columns.length === 0) {
            console.log('❌ Colonne gender introuvable\n');
            process.exit(1);
        }

        const col = columns[0];
        console.log('📊 Détails de la colonne gender:\n');
        console.log(`   Nom: ${col.Field}`);
        console.log(`   Type: ${col.Type}`);
        console.log(`   NULL: ${col.Null}`);
        console.log(`   Default: ${col.Default || 'NULL'}`);
        console.log(`   Key: ${col.Key || 'N/A'}`);
        console.log(`   Extra: ${col.Extra || 'N/A'}\n`);

        // Check if it's ENUM
        if (col.Type.startsWith('enum')) {
            console.log('✅ La colonne est de type ENUM\n');
            console.log(`   Valeurs possibles: ${col.Type}\n`);
            
            // Fix: Change to VARCHAR
            console.log('🔧 Modification en VARCHAR(10)...\n');
            
            await db.query(`
                ALTER TABLE Candidature
                MODIFY COLUMN gender VARCHAR(10) NULL
            `);
            
            console.log('✅ Colonne modifiée avec succès !\n');
            
            // Verify
            const [newColumns] = await db.query(`
                SHOW COLUMNS FROM Candidature WHERE Field = 'gender'
            `);
            
            console.log('📊 Nouvelle structure:\n');
            console.log(`   Type: ${newColumns[0].Type}\n`);
        } else {
            console.log('ℹ️  La colonne n\'est pas de type ENUM\n');
            console.log(`   Type actuel: ${col.Type}\n`);
        }

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ VÉRIFICATION TERMINÉE !\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

checkGenderColumn();
