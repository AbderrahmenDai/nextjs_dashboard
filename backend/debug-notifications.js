const db = require('./config/db');

async function debugNotificationFlow() {
    try {
        console.log('🔍 DIAGNOSTIC DU FLUX DE NOTIFICATIONS\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Vérifier Karim
        console.log('1️⃣ Vérification de Karim Mani...\n');
        
        const [karim] = await db.query(`
            SELECT User.id, User.name, User.email, Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE User.email = 'karim.mani@tescagroup.com'
        `);

        if (karim.length === 0) {
            console.log('❌ Karim introuvable !');
            process.exit(1);
        }

        console.log(`   ✅ Karim: ${karim[0].name}`);
        console.log(`   Role: ${karim[0].roleName}`);
        console.log(`   ID: ${karim[0].id}\n`);

        // 2. Vérifier les demandes "Pending Director"
        console.log('2️⃣ Demandes en attente de Karim (Pending Director)...\n');
        
        const [pendingDirector] = await db.query(`
            SELECT 
                hr.id,
                hr.title,
                hr.status,
                hr.createdAt,
                u.name as requesterName
            FROM HiringRequest hr
            LEFT JOIN User u ON hr.requesterId = u.id
            WHERE hr.status = 'Pending Director'
            ORDER BY hr.createdAt DESC
            LIMIT 5
        `);

        console.log(`   📊 ${pendingDirector.length} demande(s) avec statut "Pending Director"\n`);

        if (pendingDirector.length > 0) {
            console.log('   📋 Détails:');
            pendingDirector.forEach((req, index) => {
                console.log(`      ${index + 1}. "${req.title}"`);
                console.log(`         Demandeur: ${req.requesterName || 'Inconnu'}`);
                console.log(`         Date: ${new Date(req.createdAt).toLocaleString('fr-FR')}`);
                console.log(`         ID: ${req.id}`);
            });
            console.log('');
        }

        // 3. Vérifier les notifications de Karim
        console.log('3️⃣ Notifications de Karim...\n');
        
        const [notifications] = await db.query(`
            SELECT 
                n.id,
                n.message,
                n.type,
                n.isRead,
                n.entityType,
                n.entityId,
                n.createdAt,
                sender.name as senderName
            FROM Notification n
            LEFT JOIN User sender ON n.senderId = sender.id
            WHERE n.receiverId = ?
            ORDER BY n.createdAt DESC
            LIMIT 10
        `, [karim[0].id]);

        console.log(`   📊 ${notifications.length} notification(s) totale(s)\n`);

        if (notifications.length > 0) {
            console.log('   📋 Dernières notifications:');
            notifications.forEach((notif, index) => {
                const readStatus = notif.isRead ? '📖 Lu' : '📬 Non lu';
                const date = new Date(notif.createdAt).toLocaleString('fr-FR');
                console.log(`      ${index + 1}. ${readStatus} - ${notif.type}`);
                console.log(`         De: ${notif.senderName || 'Système'}`);
                console.log(`         Date: ${date}`);
                console.log(`         Message: "${notif.message.substring(0, 70)}..."`);
                if (notif.entityType === 'HIRING_REQUEST') {
                    console.log(`         Demande ID: ${notif.entityId}`);
                }
            });
            console.log('');
        } else {
            console.log('   ⚠️  Aucune notification trouvée pour Karim\n');
        }

        // 4. Vérifier les demandes "Pending HR"
        console.log('4️⃣ Demandes en attente de Zoubaier (Pending HR)...\n');
        
        const [pendingHR] = await db.query(`
            SELECT COUNT(*) as count
            FROM HiringRequest
            WHERE status = 'Pending HR'
        `);

        console.log(`   📊 ${pendingHR[0].count} demande(s) avec statut "Pending HR"\n`);

        // 5. Diagnostic
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🔍 DIAGNOSTIC:\n');

        if (pendingDirector.length === 0 && pendingHR[0].count > 0) {
            console.log('   ⚠️  PROBLÈME IDENTIFIÉ:');
            console.log(`      - ${pendingHR[0].count} demande(s) en attente de Zoubaier (Pending HR)`);
            console.log('      - 0 demande en attente de Karim (Pending Director)');
            console.log('');
            console.log('   💡 SOLUTION:');
            console.log('      1. Connectez-vous en tant que Zoubaier');
            console.log('         Email: zoubaier.berrebeh@tescagroup.com');
            console.log('         Password: 123');
            console.log('      2. Approuvez une demande (cliquez sur ✅)');
            console.log('      3. La notification sera alors envoyée à Karim\n');
        } else if (pendingDirector.length > 0 && notifications.length === 0) {
            console.log('   ⚠️  PROBLÈME IDENTIFIÉ:');
            console.log(`      - ${pendingDirector.length} demande(s) en "Pending Director"`);
            console.log('      - Mais 0 notification pour Karim');
            console.log('');
            console.log('   💡 SOLUTION:');
            console.log('      Les demandes ont été créées avant l\'implémentation');
            console.log('      du système de notifications.');
            console.log('');
            console.log('      Option 1: Créer une NOUVELLE demande pour tester');
            console.log('      Option 2: Réinitialiser une demande existante\n');
        } else if (pendingDirector.length > 0 && notifications.length > 0) {
            console.log('   ✅ TOUT EST CORRECT:');
            console.log(`      - ${pendingDirector.length} demande(s) en attente de Karim`);
            console.log(`      - ${notifications.length} notification(s) pour Karim`);
            console.log('');
            console.log('   💡 ACTION:');
            console.log('      Connectez-vous en tant que Karim et vérifiez');
            console.log('      les notifications dans l\'interface\n');
        } else {
            console.log('   ℹ️  AUCUNE DEMANDE EN ATTENTE:');
            console.log('');
            console.log('   💡 POUR TESTER LE WORKFLOW COMPLET:');
            console.log('      1. Créez une nouvelle demande (en tant que Demandeur)');
            console.log('      2. Zoubaier la verra et pourra l\'approuver');
            console.log('      3. Karim recevra alors une notification\n');
        }

        console.log('═══════════════════════════════════════════════════════\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

debugNotificationFlow();
