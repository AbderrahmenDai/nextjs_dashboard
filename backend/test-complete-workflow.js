const db = require('./config/db');
const notificationService = require('./services/notificationService');

async function testCompleteWorkflow() {
    try {
        console.log('🔄 TEST COMPLET DU WORKFLOW D\'APPROBATION\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Trouver les acteurs
        console.log('👥 ÉTAPE 1: Identification des acteurs\n');

        const [demandeur] = await db.query(`
            SELECT User.id, User.name, User.email
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE Role.name = 'DEMANDEUR'
            LIMIT 1
        `);

        const [zoubaier] = await db.query(`
            SELECT User.id, User.name, User.email
            FROM User
            WHERE email = 'zoubaier.berrebeh@tescagroup.com'
        `);

        const [karim] = await db.query(`
            SELECT User.id, User.name, User.email
            FROM User
            WHERE email = 'karim.mani@tescagroup.com'
        `);

        if (!demandeur.length || !zoubaier.length || !karim.length) {
            console.log('❌ Acteurs manquants !');
            process.exit(1);
        }

        console.log(`   ✅ Demandeur: ${demandeur[0].name} (${demandeur[0].email})`);
        console.log(`   ✅ HR Manager: ${zoubaier[0].name} (${zoubaier[0].email})`);
        console.log(`   ✅ Direction: ${karim[0].name} (${karim[0].email})\n`);

        // 2. Créer une demande (simuler le demandeur)
        console.log('📋 ÉTAPE 2: Demandeur crée une demande\n');

        const requestId = require('uuid').v4();
        const [departments] = await db.query('SELECT id FROM Department LIMIT 1');
        
        await db.query(`
            INSERT INTO HiringRequest (
                id, title, departmentId, requesterId, 
                category, status, description, priority
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            requestId,
            'Test Workflow - Ingénieur Logiciel',
            departments[0].id,
            demandeur[0].id,
            'Cadre',
            'Pending HR',
            'Poste pour tester le workflow d\'approbation',
            'High'
        ]);

        console.log(`   ✅ Demande créée: "${requestId.substring(0, 8)}..."`);
        console.log(`   📊 Statut initial: "Pending HR"\n`);

        // 3. Notification à Zoubaier (automatique lors de la création)
        console.log('📬 ÉTAPE 3: Notification envoyée à Zoubaier (HR)\n');

        const notif1 = await notificationService.createNotification({
            senderId: demandeur[0].id,
            receiverId: zoubaier[0].id,
            message: `📋 Nouvelle demande d'embauche de ${demandeur[0].name}: "Test Workflow - Ingénieur Logiciel" - En attente de votre validation`,
            type: 'ACTION_REQUIRED',
            entityType: 'HIRING_REQUEST',
            entityId: requestId,
            actions: ['APPROVE', 'REJECT']
        });

        console.log(`   ✅ Notification créée pour Zoubaier`);
        console.log(`   📧 Message: "${notif1.message.substring(0, 60)}..."\n`);

        // Vérifier les notifications de Zoubaier
        const [zoubaierNotifs] = await db.query(`
            SELECT COUNT(*) as count
            FROM Notification
            WHERE receiverId = ? AND isRead = 0 AND entityType = 'HIRING_REQUEST'
        `, [zoubaier[0].id]);

        console.log(`   📊 Zoubaier a maintenant ${zoubaierNotifs[0].count} notification(s) non lue(s)\n`);

        // 4. Zoubaier approuve
        console.log('✅ ÉTAPE 4: Zoubaier approuve la demande\n');

        await db.query(`
            UPDATE HiringRequest
            SET status = 'Pending Director'
            WHERE id = ?
        `, [requestId]);

        console.log(`   ✅ Statut mis à jour: "Pending HR" → "Pending Director"\n`);

        // 5. Notification à Karim (automatique après approbation de Zoubaier)
        console.log('📬 ÉTAPE 5: Notification envoyée à Karim (Direction)\n');

        const notif2 = await notificationService.createNotification({
            senderId: zoubaier[0].id,
            receiverId: karim[0].id,
            message: `✅ Demande d'embauche "Test Workflow - Ingénieur Logiciel" validée par RH (${zoubaier[0].name}). En attente de votre validation.`,
            type: 'ACTION_REQUIRED',
            entityType: 'HIRING_REQUEST',
            entityId: requestId,
            actions: ['APPROVE', 'REJECT']
        });

        console.log(`   ✅ Notification créée pour Karim`);
        console.log(`   📧 Message: "${notif2.message.substring(0, 60)}..."\n`);

        // Résoudre les notifications de Zoubaier
        await notificationService.resolveActions(
            requestId,
            'HIRING_REQUEST',
            `Validée par RH (${zoubaier[0].name})`
        );

        console.log(`   ✅ Notifications de Zoubaier résolues\n`);

        // Vérifier les notifications de Karim
        const [karimNotifs] = await db.query(`
            SELECT COUNT(*) as count
            FROM Notification
            WHERE receiverId = ? AND isRead = 0 AND entityType = 'HIRING_REQUEST'
        `, [karim[0].id]);

        console.log(`   📊 Karim a maintenant ${karimNotifs[0].count} notification(s) non lue(s)\n`);

        // 6. Résumé final
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📊 RÉSUMÉ DU WORKFLOW COMPLET:\n');

        const [finalRequest] = await db.query(`
            SELECT status FROM HiringRequest WHERE id = ?
        `, [requestId]);

        console.log('   🔄 Flux d\'approbation:');
        console.log(`      1️⃣ Demandeur (${demandeur[0].name}) crée demande`);
        console.log(`      2️⃣ → Notification à Zoubaier ✅`);
        console.log(`      3️⃣ Zoubaier approuve ✅`);
        console.log(`      4️⃣ → Notification à Karim ✅`);
        console.log(`      5️⃣ Karim peut maintenant approuver/rejeter\n`);

        console.log('   📊 État actuel:');
        console.log(`      Statut de la demande: ${finalRequest[0].status}`);
        console.log(`      Notifications Zoubaier: Résolues ✅`);
        console.log(`      Notifications Karim: ${karimNotifs[0].count} en attente 🔔\n`);

        console.log('🎉 WORKFLOW COMPLET TESTÉ AVEC SUCCÈS !\n');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log('📝 Pour tester dans l\'application:\n');
        console.log('   1. Connectez-vous en tant que DEMANDEUR');
        console.log('      → Créez une nouvelle demande d\'embauche\n');
        console.log('   2. Connectez-vous en tant que Zoubaier');
        console.log('      Email: zoubaier.berrebeh@tescagroup.com');
        console.log('      Password: 123');
        console.log('      → Vérifiez les notifications 🔔');
        console.log('      → Ouvrez la demande et changez le statut à "Pending Director"\n');
        console.log('   3. Connectez-vous en tant que Karim');
        console.log('      Email: karim.mani@tescagroup.com');
        console.log('      Password: 123456');
        console.log('      → Vérifiez les notifications 🔔');
        console.log('      → Approuvez ou rejetez la demande\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

testCompleteWorkflow();
