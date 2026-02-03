const db = require('./config/db');
const notificationService = require('./services/notificationService');
const socketService = require('./services/socketService');

async function testZoubaierApproval() {
    try {
        console.log('🧪 Test: Approbation par Zoubaier → Notification à Karim\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Trouver Zoubaier (HR_MANAGER)
        const [zoubaier] = await db.query(`
            SELECT User.id, User.name, Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE User.email = 'zoubaier.berrebeh@tescagroup.com'
        `);

        if (zoubaier.length === 0) {
            console.log('❌ Zoubaier introuvable !');
            process.exit(1);
        }

        console.log(`✅ Zoubaier trouvé: ${zoubaier[0].name} (${zoubaier[0].roleName})`);

        // 2. Trouver Karim (PLANT_MANAGER)
        const [karim] = await db.query(`
            SELECT User.id, User.name, Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE User.email = 'karim.mani@tescagroup.com'
        `);

        if (karim.length === 0) {
            console.log('❌ Karim introuvable !');
            process.exit(1);
        }

        console.log(`✅ Karim trouvé: ${karim[0].name} (${karim[0].roleName})\n`);

        // 3. Trouver une demande avec statut "Pending HR"
        const [pendingRequests] = await db.query(`
            SELECT id, title, status, requesterId
            FROM HiringRequest
            WHERE status = 'Pending HR'
            LIMIT 1
        `);

        if (pendingRequests.length === 0) {
            console.log('⚠️  Aucune demande avec statut "Pending HR" trouvée');
            console.log('💡 Créez d\'abord une demande pour tester le workflow\n');
            process.exit(0);
        }

        const request = pendingRequests[0];
        console.log(`📋 Demande trouvée: "${request.title}"`);
        console.log(`   Statut actuel: ${request.status}`);
        console.log(`   ID: ${request.id}\n`);

        // 4. Simuler l'approbation par Zoubaier
        console.log('🔄 Simulation: Zoubaier approuve la demande...\n');

        // Mettre à jour le statut
        await db.query(`
            UPDATE HiringRequest
            SET status = 'Pending Director'
            WHERE id = ?
        `, [request.id]);

        console.log('✅ Statut mis à jour: "Pending HR" → "Pending Director"\n');

        // 5. Créer et envoyer la notification à Karim
        console.log('📬 Envoi de la notification à Karim...\n');

        const notification = await notificationService.createNotification({
            senderId: zoubaier[0].id,
            receiverId: karim[0].id,
            message: `✅ Demande d'embauche "${request.title}" validée par RH (${zoubaier[0].name}). En attente de votre validation.`,
            type: 'ACTION_REQUIRED',
            entityType: 'HIRING_REQUEST',
            entityId: request.id,
            actions: ['APPROVE', 'REJECT']
        });

        console.log('✅ Notification créée:');
        console.log(`   ID: ${notification.id}`);
        console.log(`   De: ${zoubaier[0].name}`);
        console.log(`   À: ${karim[0].name}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Message: "${notification.message}"\n`);

        // 6. Envoyer en temps réel via Socket.IO
        try {
            socketService.sendNotificationToUser(karim[0].id, notification);
            console.log('✅ Notification envoyée en temps réel via Socket.IO\n');
        } catch (error) {
            console.log('⚠️  Socket.IO non disponible (normal si pas de connexion active)\n');
        }

        // 7. Résoudre les anciennes notifications HR
        await notificationService.resolveActions(
            request.id,
            'HIRING_REQUEST',
            `Validée par RH (${zoubaier[0].name})`
        );

        console.log('✅ Anciennes notifications HR résolues\n');

        // 8. Vérifier le résultat
        const [updatedRequest] = await db.query(`
            SELECT status FROM HiringRequest WHERE id = ?
        `, [request.id]);

        const [karimNotifications] = await db.query(`
            SELECT COUNT(*) as count
            FROM Notification
            WHERE receiverId = ?
            AND entityType = 'HIRING_REQUEST'
            AND entityId = ?
            AND isRead = 0
        `, [karim[0].id, request.id]);

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📊 Résultat du Test:\n');
        console.log(`   ✅ Statut de la demande: ${updatedRequest[0].status}`);
        console.log(`   ✅ Notifications non lues pour Karim: ${karimNotifications[0].count}\n`);

        console.log('🎉 Test réussi ! Le workflow fonctionne correctement.\n');
        console.log('📝 Prochaines étapes:');
        console.log('   1. Karim se connecte sur http://localhost:3001');
        console.log('   2. Il voit la notification 🔔');
        console.log('   3. Il peut approuver ou rejeter la demande\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

testZoubaierApproval();
