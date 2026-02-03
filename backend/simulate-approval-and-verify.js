const db = require('./config/db');
const notificationService = require('./services/notificationService');

async function simulateZoubaierApprovalAndVerify() {
    try {
        console.log('🧪 SIMULATION: Zoubaier approuve → Karim reçoit notification\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Get Zoubaier
        const [zoubaier] = await db.query(`
            SELECT User.id, User.name FROM User
            WHERE email = 'zoubaier.berrebeh@tescagroup.com'
        `);

        if (zoubaier.length === 0) {
            console.log('❌ Zoubaier introuvable');
            process.exit(1);
        }

        console.log(`✅ Zoubaier: ${zoubaier[0].name} (${zoubaier[0].id})\n`);

        // 2. Get Karim
        const [karim] = await db.query(`
            SELECT User.id, User.name FROM User
            WHERE email = 'karim.mani@tescagroup.com'
        `);

        if (karim.length === 0) {
            console.log('❌ Karim introuvable');
            process.exit(1);
        }

        console.log(`✅ Karim: ${karim[0].name} (${karim[0].id})\n`);

        // 3. Count Karim's notifications BEFORE
        const [notifsBefore] = await db.query(`
            SELECT COUNT(*) as count FROM Notification
            WHERE receiverId = ? AND isRead = 0
        `, [karim[0].id]);

        console.log(`📊 AVANT l'approbation:`);
        console.log(`   Notifications non lues de Karim: ${notifsBefore[0].count}\n`);

        // 4. Find the test request we just created
        const [testRequest] = await db.query(`
            SELECT id, title, status FROM HiringRequest
            WHERE title LIKE 'Test Notification%'
            AND status = 'Pending HR'
            ORDER BY createdAt DESC
            LIMIT 1
        `);

        if (testRequest.length === 0) {
            console.log('❌ Aucune demande de test trouvée avec statut "Pending HR"');
            console.log('💡 Exécutez d\'abord: node create-test-request.js\n');
            process.exit(1);
        }

        const request = testRequest[0];
        console.log(`📋 Demande trouvée:`);
        console.log(`   Titre: "${request.title}"`);
        console.log(`   Statut actuel: ${request.status}`);
        console.log(`   ID: ${request.id}\n`);

        // 5. SIMULATE Zoubaier's approval
        console.log('🔄 SIMULATION: Zoubaier approuve la demande...\n');

        // Update status to "Pending Director"
        await db.query(`
            UPDATE HiringRequest
            SET status = 'Pending Director'
            WHERE id = ?
        `, [request.id]);

        console.log(`   ✅ Statut mis à jour: "Pending HR" → "Pending Director"\n`);

        // 6. Create notification for Karim (as the backend would do)
        console.log('📬 Création de la notification pour Karim...\n');

        const notification = await notificationService.createNotification({
            senderId: zoubaier[0].id,
            receiverId: karim[0].id,
            message: `✅ Demande d'embauche "${request.title}" validée par RH (${zoubaier[0].name}). En attente de votre validation.`,
            type: 'ACTION_REQUIRED',
            entityType: 'HIRING_REQUEST',
            entityId: request.id,
            actions: ['APPROVE', 'REJECT']
        });

        console.log(`   ✅ Notification créée !`);
        console.log(`   ID: ${notification.id}`);
        console.log(`   Type: ${notification.type}`);
        console.log(`   Message: "${notification.message}"\n`);

        // 7. Resolve Zoubaier's notifications
        await notificationService.resolveActions(
            request.id,
            'HIRING_REQUEST',
            `Validée par RH (${zoubaier[0].name})`
        );

        console.log(`   ✅ Notifications de Zoubaier résolues\n`);

        // 8. Count Karim's notifications AFTER
        const [notifsAfter] = await db.query(`
            SELECT COUNT(*) as count FROM Notification
            WHERE receiverId = ? AND isRead = 0
        `, [karim[0].id]);

        console.log(`📊 APRÈS l'approbation:`);
        console.log(`   Notifications non lues de Karim: ${notifsAfter[0].count}\n`);

        // 9. Verify the specific notification
        const [karimNotifs] = await db.query(`
            SELECT 
                n.id,
                n.message,
                n.type,
                n.isRead,
                n.createdAt
            FROM Notification n
            WHERE n.receiverId = ?
            AND n.entityId = ?
            ORDER BY n.createdAt DESC
            LIMIT 1
        `, [karim[0].id, request.id]);

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ VÉRIFICATION:\n');

        if (karimNotifs.length > 0) {
            const notif = karimNotifs[0];
            console.log(`   ✅ Karim a bien reçu la notification !`);
            console.log(`   📬 Statut: ${notif.isRead ? 'Lue' : 'NON LUE'}`);
            console.log(`   📅 Date: ${new Date(notif.createdAt).toLocaleString('fr-FR')}`);
            console.log(`   📝 Message: "${notif.message}"\n`);

            if (!notif.isRead) {
                console.log('   🎉 La notification est NON LUE - Karim la verra dans l\'interface !\n');
            }
        } else {
            console.log(`   ❌ Aucune notification trouvée pour Karim\n`);
        }

        // 10. Show what Karim should see
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📱 CE QUE KARIM VERRA DANS L\'INTERFACE:\n');
        console.log(`   1. Badge 🔔 avec le chiffre: ${notifsAfter[0].count}`);
        console.log(`   2. Notification:`);
        console.log(`      "✅ Demande d'embauche "${request.title}" validée par RH..."`);
        console.log(`   3. Dans "Demandes d'Embauche":`);
        console.log(`      - Demande: "${request.title}"`);
        console.log(`      - Statut: 🟠 "Pending Director"`);
        console.log(`      - Boutons: ✅ Approuver | ❌ Rejeter\n`);

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🎯 RÉSULTAT FINAL:\n');
        console.log(`   ✅ Zoubaier a approuvé la demande`);
        console.log(`   ✅ Statut changé: "Pending HR" → "Pending Director"`);
        console.log(`   ✅ Notification envoyée à Karim`);
        console.log(`   ✅ Karim a ${notifsAfter[0].count} notification(s) non lue(s)\n`);

        console.log('💡 POUR VÉRIFIER DANS L\'INTERFACE:\n');
        console.log('   1. Ouvrez http://localhost:3001');
        console.log('   2. Connectez-vous en tant que Karim:');
        console.log('      Email: karim.mani@tescagroup.com');
        console.log('      Password: 123456');
        console.log('   3. Cliquez sur l\'icône 🔔');
        console.log(`   4. Vous devriez voir ${notifsAfter[0].count} notification(s)\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

simulateZoubaierApprovalAndVerify();
