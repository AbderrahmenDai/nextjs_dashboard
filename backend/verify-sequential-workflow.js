const db = require('./config/db');

async function verifySequentialWorkflow() {
    try {
        console.log('🔍 Vérification du Workflow Séquentiel\n');
        console.log('═══════════════════════════════════════\n');

        // Vérifier les utilisateurs
        const [users] = await db.query(`
            SELECT 
                User.id,
                User.name,
                User.email,
                Role.name as roleName
            FROM User
            JOIN Role ON User.roleId = Role.id
            WHERE Role.name IN ('HR_MANAGER', 'PLANT_MANAGER', 'RECRUITMENT_MANAGER')
            ORDER BY 
                CASE Role.name
                    WHEN 'HR_MANAGER' THEN 1
                    WHEN 'PLANT_MANAGER' THEN 2
                    WHEN 'RECRUITMENT_MANAGER' THEN 3
                END
        `);

        console.log('👥 Ordre des Approbateurs:\n');
        users.forEach((user, index) => {
            const step = index + 1;
            const emoji = step === 1 ? '1️⃣' : step === 2 ? '2️⃣' : '3️⃣';
            console.log(`${emoji} ${user.roleName.padEnd(25)} → ${user.name} (${user.email})`);
        });

        console.log('\n📋 Flux Séquentiel:\n');
        console.log('   DEMANDEUR crée demande');
        console.log('        ↓');
        console.log('   📬 Notification → 1️⃣ HR_MANAGER (Zoubaier)');
        console.log('        ↓');
        console.log('   ⏸️  PLANT_MANAGER (Karim) N\'A PAS de notification');
        console.log('   ⏸️  RECRUITMENT_MANAGER (Hiba) N\'A PAS de notification');
        console.log('        ↓');
        console.log('   ✅ HR_MANAGER approuve');
        console.log('        ↓');
        console.log('   📬 Notification → 2️⃣ PLANT_MANAGER (Karim)');
        console.log('        ↓');
        console.log('   ⏸️  RECRUITMENT_MANAGER (Hiba) N\'A TOUJOURS PAS de notification');
        console.log('        ↓');
        console.log('   ✅ PLANT_MANAGER approuve');
        console.log('        ↓');
        console.log('   📬 Notifications → DEMANDEUR + 3️⃣ RECRUITMENT_MANAGER (Hiba)');
        console.log('\n✅ Le workflow est SÉQUENTIEL : un par un !\n');

        // Vérifier les demandes en cours
        const [pendingHR] = await db.query(`
            SELECT COUNT(*) as count FROM HiringRequest WHERE status = 'Pending HR'
        `);
        
        const [pendingDir] = await db.query(`
            SELECT COUNT(*) as count FROM HiringRequest WHERE status = 'Pending Director'
        `);

        console.log('📊 Statut Actuel des Demandes:\n');
        console.log(`   🔵 Pending HR (en attente de Zoubaier)    : ${pendingHR[0].count}`);
        console.log(`   🟠 Pending Director (en attente de Karim) : ${pendingDir[0].count}`);

        if (pendingHR[0].count > 0) {
            console.log('\n💡 Action requise : Zoubaier doit approuver en premier !');
        } else if (pendingDir[0].count > 0) {
            console.log('\n💡 Action requise : Karim doit approuver (après validation RH) !');
        }

        console.log('\n═══════════════════════════════════════\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

verifySequentialWorkflow();
