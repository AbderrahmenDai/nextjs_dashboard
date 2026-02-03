const db = require('./config/db');

async function verifyKarimMani() {
    try {
        console.log('🔍 Vérification de Karim Mani (PLANT_MANAGER)\n');
        console.log('═══════════════════════════════════════════════\n');

        // 1. Vérifier que Karim existe avec le bon rôle
        const [karim] = await db.query(`
            SELECT 
                User.id,
                User.name,
                User.email,
                Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE User.email = 'karim.mani@tescagroup.com'
        `);

        if (karim.length === 0) {
            console.log('❌ ERREUR: Karim Mani introuvable !');
            process.exit(1);
        }

        const karimData = karim[0];
        console.log('✅ Karim Mani trouvé:');
        console.log(`   Nom:   ${karimData.name}`);
        console.log(`   Email: ${karimData.email}`);
        console.log(`   Rôle:  ${karimData.roleName}`);
        console.log(`   ID:    ${karimData.id}\n`);

        if (karimData.roleName !== 'PLANT_MANAGER') {
            console.log(`❌ ERREUR: Karim a le rôle "${karimData.roleName}" au lieu de "PLANT_MANAGER"`);
            process.exit(1);
        }

        // 2. Vérifier les notifications reçues par Karim
        const [notifications] = await db.query(`
            SELECT 
                n.id,
                n.message,
                n.type,
                n.isRead,
                n.createdAt,
                sender.name as senderName
            FROM Notification n
            LEFT JOIN User sender ON n.senderId = sender.id
            WHERE n.receiverId = ?
            AND n.entityType = 'HIRING_REQUEST'
            ORDER BY n.createdAt DESC
            LIMIT 5
        `, [karimData.id]);

        console.log('📬 Notifications récentes pour Karim:\n');
        if (notifications.length === 0) {
            console.log('   ⚠️  Aucune notification trouvée');
            console.log('   💡 Karim recevra des notifications quand Zoubaier approuvera des demandes\n');
        } else {
            notifications.forEach((notif, index) => {
                const readStatus = notif.isRead ? '📖 Lu' : '📬 Non lu';
                const date = new Date(notif.createdAt).toLocaleString('fr-FR');
                console.log(`   ${index + 1}. ${readStatus} - ${notif.type}`);
                console.log(`      De: ${notif.senderName || 'Système'}`);
                console.log(`      Date: ${date}`);
                console.log(`      Message: "${notif.message.substring(0, 80)}..."`);
                console.log('');
            });
        }

        // 3. Vérifier les demandes en attente de Karim
        const [pendingForKarim] = await db.query(`
            SELECT COUNT(*) as count
            FROM HiringRequest
            WHERE status = 'Pending Director'
        `);

        console.log('📊 Demandes en attente de validation par Karim:\n');
        console.log(`   🟠 ${pendingForKarim[0].count} demande(s) avec statut "Pending Director"\n`);

        if (pendingForKarim[0].count > 0) {
            console.log('   💡 Karim peut se connecter pour approuver/rejeter ces demandes\n');
        }

        console.log('═══════════════════════════════════════════════\n');
        console.log('✅ Configuration de Karim Mani: OK\n');
        console.log('📝 Workflow:');
        console.log('   1. Zoubaier (HR_MANAGER) approuve une demande');
        console.log('   2. Statut change → "Pending Director"');
        console.log('   3. 📬 Notification envoyée automatiquement à Karim');
        console.log('   4. Karim peut approuver/rejeter\n');

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

verifyKarimMani();
