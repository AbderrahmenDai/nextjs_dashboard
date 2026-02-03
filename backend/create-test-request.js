const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const notificationService = require('./services/notificationService');

async function createTestRequest() {
    try {
        console.log('🧪 CRÉATION D\'UNE DEMANDE DE TEST\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Get a demandeur
        const [demandeurs] = await db.query(`
            SELECT User.id, User.name, User.email
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE Role.name = 'DEMANDEUR'
            LIMIT 1
        `);

        if (demandeurs.length === 0) {
            console.log('❌ Aucun demandeur trouvé');
            process.exit(1);
        }

        const demandeur = demandeurs[0];
        console.log(`👤 Demandeur: ${demandeur.name} (${demandeur.email})\n`);

        // 2. Get a department
        const [departments] = await db.query('SELECT id, name FROM Department LIMIT 1');
        
        if (departments.length === 0) {
            console.log('❌ Aucun département trouvé');
            process.exit(1);
        }

        console.log(`🏢 Département: ${departments[0].name}\n`);

        // 3. Create the hiring request
        const requestId = uuidv4();
        const title = `Test Notification - ${new Date().toLocaleTimeString('fr-FR')}`;

        await db.query(`
            INSERT INTO HiringRequest (
                id, title, departmentId, requesterId,
                category, status, description, priority, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            requestId,
            title,
            departments[0].id,
            demandeur.id,
            'Cadre',
            'Pending HR',
            'Demande créée pour tester le système de notifications',
            'High'
        ]);

        console.log('✅ Demande créée:');
        console.log(`   Titre: "${title}"`);
        console.log(`   ID: ${requestId}`);
        console.log(`   Statut: Pending HR\n`);

        // 4. Create notification for HR_MANAGER (Zoubaier)
        const [hrManagers] = await db.query(`
            SELECT User.id, User.name FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE Role.name = 'HR_MANAGER'
        `);

        if (hrManagers.length === 0) {
            console.log('⚠️  Aucun HR_MANAGER trouvé');
        } else {
            for (const hrManager of hrManagers) {
                const notification = await notificationService.createNotification({
                    senderId: demandeur.id,
                    receiverId: hrManager.id,
                    message: `📋 Nouvelle demande d'embauche de ${demandeur.name}: "${title}" - En attente de votre validation`,
                    type: 'ACTION_REQUIRED',
                    entityType: 'HIRING_REQUEST',
                    entityId: requestId,
                    actions: ['APPROVE', 'REJECT']
                });

                console.log(`✅ Notification créée pour ${hrManager.name}`);
                console.log(`   ID: ${notification.id}\n`);
            }
        }

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🎉 DEMANDE DE TEST CRÉÉE AVEC SUCCÈS !\n');
        console.log('📝 PROCHAINES ÉTAPES:\n');
        console.log('   1. Connectez-vous en tant que Zoubaier:');
        console.log('      Email: zoubaier.berrebeh@tescagroup.com');
        console.log('      Password: 123');
        console.log('');
        console.log('   2. Vous verrez une notification 🔔');
        console.log('');
        console.log('   3. Allez sur "Demandes d\'Embauche"');
        console.log('');
        console.log('   4. Trouvez la demande:');
        console.log(`      "${title}"`);
        console.log('');
        console.log('   5. Cliquez sur ✅ (Approuver)');
        console.log('');
        console.log('   6. La notification sera envoyée à Karim !');
        console.log('');
        console.log('   7. Connectez-vous en tant que Karim:');
        console.log('      Email: karim.mani@tescagroup.com');
        console.log('      Password: 123456');
        console.log('');
        console.log('   8. Vous verrez la notification 🔔\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

createTestRequest();
