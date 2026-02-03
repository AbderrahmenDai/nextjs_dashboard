const db = require('./config/db');

async function showKarimNotifications() {
    try {
        console.log('📬 NOTIFICATIONS DE KARIM MANI\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // Get Karim
        const [karim] = await db.query(`
            SELECT id, name, email FROM User
            WHERE email = 'karim.mani@tescagroup.com'
        `);

        if (karim.length === 0) {
            console.log('❌ Karim introuvable');
            process.exit(1);
        }

        console.log(`👤 Utilisateur: ${karim[0].name}`);
        console.log(`📧 Email: ${karim[0].email}`);
        console.log(`🆔 ID: ${karim[0].id}\n`);

        // Get all notifications
        const [allNotifs] = await db.query(`
            SELECT 
                n.id,
                n.message,
                n.type,
                n.isRead,
                n.entityType,
                n.entityId,
                n.createdAt,
                sender.name as senderName,
                sender.email as senderEmail
            FROM Notification n
            LEFT JOIN User sender ON n.senderId = sender.id
            WHERE n.receiverId = ?
            ORDER BY n.createdAt DESC
        `, [karim[0].id]);

        console.log(`📊 TOTAL: ${allNotifs.length} notification(s)\n`);

        // Count unread
        const unreadCount = allNotifs.filter(n => !n.isRead).length;
        console.log(`📬 Non lues: ${unreadCount}`);
        console.log(`📖 Lues: ${allNotifs.length - unreadCount}\n`);

        console.log('═══════════════════════════════════════════════════════\n');

        if (allNotifs.length === 0) {
            console.log('⚠️  Aucune notification trouvée\n');
            console.log('💡 Pour créer une notification:');
            console.log('   1. Créez une nouvelle demande d\'embauche');
            console.log('   2. Zoubaier l\'approuve');
            console.log('   3. Karim recevra une notification\n');
            process.exit(0);
        }

        // Show all notifications
        console.log('📋 LISTE DES NOTIFICATIONS:\n');

        allNotifs.forEach((notif, index) => {
            const readIcon = notif.isRead ? '📖' : '📬';
            const typeIcon = notif.type === 'ACTION_REQUIRED' ? '⚡' : 'ℹ️';
            const date = new Date(notif.createdAt).toLocaleString('fr-FR');

            console.log(`${index + 1}. ${readIcon} ${typeIcon} ${notif.type}`);
            console.log(`   De: ${notif.senderName || 'Système'} (${notif.senderEmail || 'N/A'})`);
            console.log(`   Date: ${date}`);
            console.log(`   Message: "${notif.message}"`);
            
            if (notif.entityType) {
                console.log(`   Type: ${notif.entityType}`);
                console.log(`   Entity ID: ${notif.entityId}`);
            }
            
            console.log('');
        });

        // Show hiring request notifications specifically
        const hiringNotifs = allNotifs.filter(n => n.entityType === 'HIRING_REQUEST');
        
        if (hiringNotifs.length > 0) {
            console.log('═══════════════════════════════════════════════════════\n');
            console.log(`🎯 NOTIFICATIONS DE DEMANDES D'EMBAUCHE: ${hiringNotifs.length}\n`);

            for (const notif of hiringNotifs) {
                // Get the hiring request details
                const [request] = await db.query(`
                    SELECT title, status FROM HiringRequest WHERE id = ?
                `, [notif.entityId]);

                if (request.length > 0) {
                    const readIcon = notif.isRead ? '📖' : '📬';
                    console.log(`${readIcon} "${request[0].title}"`);
                    console.log(`   Statut: ${request[0].status}`);
                    console.log(`   Message: "${notif.message.substring(0, 80)}..."`);
                    console.log(`   Date: ${new Date(notif.createdAt).toLocaleString('fr-FR')}`);
                    console.log('');
                }
            }
        }

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ VÉRIFICATION TERMINÉE\n');
        console.log('💡 POUR VOIR CES NOTIFICATIONS DANS L\'INTERFACE:\n');
        console.log('   1. Ouvrez http://localhost:3001');
        console.log('   2. Connectez-vous avec:');
        console.log('      Email: karim.mani@tescagroup.com');
        console.log('      Password: 123456');
        console.log('   3. Cliquez sur l\'icône 🔔 en haut à droite');
        console.log(`   4. Vous devriez voir ${unreadCount} notification(s) non lue(s)\n`);

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

showKarimNotifications();
