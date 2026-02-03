const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function testCreateCandidature() {
    try {
        console.log('🧪 TEST: Création d\'une candidature\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Check table structure
        console.log('📋 Structure de la table Candidature:\n');
        const [columns] = await db.query(`
            SHOW COLUMNS FROM Candidature
        `);

        columns.forEach(col => {
            const nullable = col.Null === 'YES' ? '✅ NULL' : '❌ NOT NULL';
            const defaultVal = col.Default !== null ? `(default: ${col.Default})` : '';
            console.log(`   ${col.Field.padEnd(25)} ${col.Type.padEnd(20)} ${nullable} ${defaultVal}`);
        });

        console.log('\n═══════════════════════════════════════════════════════\n');

        // 2. Get a department
        const [departments] = await db.query('SELECT id, name FROM Department LIMIT 1');
        
        if (departments.length === 0) {
            console.log('❌ Aucun département trouvé');
            process.exit(1);
        }

        console.log(`✅ Département trouvé: ${departments[0].name}\n`);

        // 3. Create test data
        const testData = {
            id: uuidv4(),
            firstName: 'Test',
            lastName: 'Candidat',
            email: 'test.candidat@example.com',
            phone: '0123456789',
            birthDate: new Date('1990-01-01'),
            gender: 'M',
            address: '123 Test Street',
            positionAppliedFor: 'Développeur',
            department: departments[0].name,
            specialty: 'Informatique',
            level: 'Confirmé',
            yearsOfExperience: 5,
            language: 'Français',
            source: 'LinkedIn',
            hiringRequestId: null,
            recruiterComments: 'Test candidature',
            educationLevel: 'Licence',
            familySituation: 'Célibataire',
            studySpecialty: 'Informatique',
            currentSalary: 30000,
            salaryExpectation: 35000,
            proposedSalary: 33000,
            noticePeriod: '1 mois',
            hrOpinion: 'Bon profil',
            managerOpinion: 'À valider',
            recruitmentMode: 'Externe',
            workSite: 'Tunis',
            cvPath: null
        };

        console.log('📝 Données de test:\n');
        Object.keys(testData).forEach(key => {
            console.log(`   ${key.padEnd(25)}: ${testData[key]}`);
        });

        console.log('\n═══════════════════════════════════════════════════════\n');

        // 4. Try to insert
        console.log('💾 Tentative d\'insertion...\n');

        const sql = `
            INSERT INTO Candidature (
                id, firstName, lastName, email, phone, birthDate, gender, address,
                positionAppliedFor, department, specialty, level, yearsOfExperience, language,
                source, hiringRequestId, recruiterComments,
                educationLevel, familySituation, studySpecialty, currentSalary, salaryExpectation,
                proposedSalary, noticePeriod, hrOpinion, managerOpinion, recruitmentMode, workSite, cvPath
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            testData.id,
            testData.firstName,
            testData.lastName,
            testData.email,
            testData.phone,
            testData.birthDate,
            testData.gender,
            testData.address,
            testData.positionAppliedFor,
            testData.department,
            testData.specialty,
            testData.level,
            testData.yearsOfExperience,
            testData.language,
            testData.source,
            testData.hiringRequestId,
            testData.recruiterComments,
            testData.educationLevel,
            testData.familySituation,
            testData.studySpecialty,
            testData.currentSalary,
            testData.salaryExpectation,
            testData.proposedSalary,
            testData.noticePeriod,
            testData.hrOpinion,
            testData.managerOpinion,
            testData.recruitmentMode,
            testData.workSite,
            testData.cvPath
        ];

        await db.query(sql, values);

        console.log('✅ Candidature créée avec succès !\n');
        console.log(`   ID: ${testData.id}\n`);

        // 5. Verify
        const [result] = await db.query('SELECT * FROM Candidature WHERE id = ?', [testData.id]);
        
        if (result.length > 0) {
            console.log('✅ Vérification: Candidature trouvée dans la base de données\n');
            console.log('📊 Données enregistrées:\n');
            Object.keys(result[0]).forEach(key => {
                console.log(`   ${key.padEnd(25)}: ${result[0][key]}`);
            });
        }

        // 6. Cleanup
        console.log('\n═══════════════════════════════════════════════════════\n');
        console.log('🧹 Nettoyage: Suppression de la candidature de test...\n');
        await db.query('DELETE FROM Candidature WHERE id = ?', [testData.id]);
        console.log('✅ Candidature de test supprimée\n');

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ TEST RÉUSSI !\n');
        console.log('💡 La création de candidatures fonctionne correctement.\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ ERREUR:\n');
        console.error(error);
        console.error('\n═══════════════════════════════════════════════════════\n');
        console.error('💡 DIAGNOSTIC:\n');
        
        if (error.code === 'ER_BAD_FIELD_ERROR') {
            console.error('   ⚠️  Champ manquant ou incorrect dans la table');
            console.error('   📝 Vérifiez la structure de la table Candidature');
        } else if (error.code === 'ER_NO_DEFAULT_FOR_FIELD') {
            console.error('   ⚠️  Un champ obligatoire n\'a pas de valeur');
            console.error('   📝 Vérifiez que tous les champs NOT NULL ont une valeur');
        } else if (error.code === 'ER_DUP_ENTRY') {
            console.error('   ⚠️  Entrée dupliquée (email ou autre champ unique)');
        } else {
            console.error('   ⚠️  Erreur inconnue');
            console.error(`   Code: ${error.code}`);
            console.error(`   Message: ${error.message}`);
        }

        console.error('\n');
        process.exit(1);
    }
}

testCreateCandidature();
