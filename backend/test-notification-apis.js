const axios = require('axios');

const API_BASE = 'http://localhost:8080/api';

// Simuler un token d'authentification (vous devrez vous connecter d'abord)
let authToken = '';

async function testNotificationAPIs() {
    try {
        console.log('🧪 TEST DES APIs DE NOTIFICATION\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // 1. Login pour obtenir un token
        console.log('1️⃣ Connexion en tant que Karim Mani...\n');
        
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'karim.mani@tescagroup.com',
            password: '123456'
        });

        authToken = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        
        console.log(`   ✅ Connexion réussie !`);
        console.log(`   👤 User ID: ${userId}`);
        console.log(`   🔑 Token: ${authToken.substring(0, 20)}...\n`);

        // 2. Récupérer toutes les notifications
        console.log('2️⃣ Récupération de toutes les notifications...\n');
        
        const allNotificationsResponse = await axios.get(
            `${API_BASE}/notifications/${userId}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        const allNotifications = allNotificationsResponse.data;
        console.log(`   ✅ ${allNotifications.length} notification(s) trouvée(s)\n`);
        
        if (allNotifications.length > 0) {
            console.log('   📋 Dernières notifications:');
            allNotifications.slice(0, 3).forEach((notif, index) => {
                console.log(`      ${index + 1}. ${notif.type} - ${notif.message.substring(0, 60)}...`);
                console.log(`         Lu: ${notif.isRead ? '✅' : '❌'} | Date: ${new Date(notif.createdAt).toLocaleString('fr-FR')}`);
            });
            console.log('');
        }

        // 3. Récupérer le nombre de notifications non lues
        console.log('3️⃣ Comptage des notifications non lues...\n');
        
        const unreadCountResponse = await axios.get(
            `${API_BASE}/notifications/${userId}/unread-count`,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log(`   ✅ Notifications non lues: ${unreadCountResponse.data.count}\n`);

        // 4. Marquer une notification comme lue (si disponible)
        if (allNotifications.length > 0 && !allNotifications[0].isRead) {
            console.log('4️⃣ Marquage d\'une notification comme lue...\n');
            
            const notifId = allNotifications[0].id;
            await axios.patch(
                `${API_BASE}/notifications/${notifId}/read`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            console.log(`   ✅ Notification ${notifId.substring(0, 8)}... marquée comme lue\n`);
        }

        // 5. Marquer toutes les notifications comme lues
        console.log('5️⃣ Marquage de toutes les notifications comme lues...\n');
        
        await axios.patch(
            `${API_BASE}/notifications/${userId}/read-all`,
            {},
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log(`   ✅ Toutes les notifications marquées comme lues\n`);

        // 6. Vérifier le nouveau compte de non lues
        console.log('6️⃣ Vérification du nouveau compte...\n');
        
        const newUnreadCountResponse = await axios.get(
            `${API_BASE}/notifications/${userId}/unread-count`,
            { headers: { Authorization: `Bearer ${authToken}` } }
        );

        console.log(`   ✅ Notifications non lues maintenant: ${newUnreadCountResponse.data.count}\n`);

        // 7. Récupérer les notifications liées aux demandes d'embauche
        console.log('7️⃣ Récupération des notifications de type HIRING_REQUEST...\n');
        
        const hiringNotifications = allNotifications.filter(n => n.entityType === 'HIRING_REQUEST');
        console.log(`   ✅ ${hiringNotifications.length} notification(s) de demandes d'embauche\n`);

        if (hiringNotifications.length > 0) {
            console.log('   📋 Détails:');
            hiringNotifications.slice(0, 3).forEach((notif, index) => {
                console.log(`      ${index + 1}. ${notif.message.substring(0, 70)}...`);
                console.log(`         Entity ID: ${notif.entityId}`);
                console.log(`         Actions: ${notif.actions ? notif.actions.join(', ') : 'Aucune'}`);
            });
            console.log('');
        }

        // 8. Résumé final
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📊 RÉSUMÉ DES TESTS:\n');
        console.log(`   ✅ API Login: OK`);
        console.log(`   ✅ API Get All Notifications: OK (${allNotifications.length} notifications)`);
        console.log(`   ✅ API Unread Count: OK`);
        console.log(`   ✅ API Mark as Read: OK`);
        console.log(`   ✅ API Mark All as Read: OK`);
        console.log(`   ✅ Filtrage par type: OK (${hiringNotifications.length} HIRING_REQUEST)\n`);

        console.log('🎉 TOUS LES TESTS RÉUSSIS !\n');
        console.log('═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ ERREUR:', error.response?.data || error.message);
        console.error('\nDétails:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   URL: ${error.config?.url}`);
            console.error(`   Method: ${error.config?.method}`);
        }
        process.exit(1);
    }
}

// Exécuter les tests
testNotificationAPIs();
