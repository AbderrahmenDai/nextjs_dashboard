const db = require('./config/db');

async function listAllUsers() {
    try {
        console.log('👥 LISTE DES UTILISATEURS ET AUTHENTIFICATION\n');
        console.log('═══════════════════════════════════════════════════════\n');

        // Get all users with their roles
        const [users] = await db.query(`
            SELECT 
                User.id,
                User.name,
                User.email,
                User.status,
                Role.name as roleName,
                Department.name as departmentName
            FROM User
            LEFT JOIN Role ON User.roleId = Role.id
            LEFT JOIN Department ON User.departmentId = Department.id
            ORDER BY Role.name, User.name
        `);

        console.log(`📊 Total: ${users.length} utilisateur(s)\n`);
        console.log('═══════════════════════════════════════════════════════\n');

        // Group by role
        const usersByRole = {};
        users.forEach(user => {
            const role = user.roleName || 'NO_ROLE';
            if (!usersByRole[role]) {
                usersByRole[role] = [];
            }
            usersByRole[role].push(user);
        });

        // Display by role
        Object.keys(usersByRole).sort().forEach(role => {
            console.log(`\n🏷️  RÔLE: ${role}\n`);
            console.log('─'.repeat(55) + '\n');

            usersByRole[role].forEach((user, index) => {
                console.log(`${index + 1}. 👤 ${user.name}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   🔑 Password: [voir ci-dessous]`);
                console.log(`   🏢 Département: ${user.departmentName || 'N/A'}`);
                console.log(`   📊 Statut: ${user.status}`);
                console.log(`   🆔 ID: ${user.id}`);
                console.log('');
            });
        });

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🔑 MOTS DE PASSE PAR DÉFAUT\n');
        console.log('─'.repeat(55) + '\n');
        console.log('⚠️  Note: Les mots de passe sont hashés dans la base de données.');
        console.log('   Voici les mots de passe par défaut utilisés:\n');
        console.log('   • Utilisateurs standards: 123');
        console.log('   • Karim Mani (PLANT_MANAGER): 123456');
        console.log('   • Admin: admin123\n');

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📋 UTILISATEURS CLÉS POUR LE WORKFLOW D\'APPROBATION\n');
        console.log('─'.repeat(55) + '\n');

        // Key users for approval workflow
        const keyUsers = [
            { email: 'zoubaier.berrebeh@tescagroup.com', role: 'HR_MANAGER', password: '123' },
            { email: 'karim.mani@tescagroup.com', role: 'PLANT_MANAGER', password: '123456' },
            { email: 'hiba.saadani@tescagroup.com', role: 'RECRUITMENT_MANAGER', password: '123' }
        ];

        keyUsers.forEach((keyUser, index) => {
            const user = users.find(u => u.email === keyUser.email);
            if (user) {
                console.log(`${index + 1}. ${keyUser.role}`);
                console.log(`   👤 Nom: ${user.name}`);
                console.log(`   📧 Email: ${user.email}`);
                console.log(`   🔑 Password: ${keyUser.password}`);
                console.log('');
            } else {
                console.log(`${index + 1}. ${keyUser.role}`);
                console.log(`   ❌ Utilisateur non trouvé: ${keyUser.email}`);
                console.log('');
            }
        });

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('📝 COMMENT SE CONNECTER\n');
        console.log('─'.repeat(55) + '\n');
        console.log('1. Ouvrez: http://localhost:3001');
        console.log('2. Entrez l\'email et le mot de passe');
        console.log('3. Cliquez sur "Se connecter"\n');

        console.log('═══════════════════════════════════════════════════════\n');
        console.log('🔐 TABLEAU RÉCAPITULATIF DES CONNEXIONS\n');
        console.log('─'.repeat(55) + '\n');

        // Create a summary table
        const summaryUsers = users.filter(u => 
            u.email.includes('zoubaier') || 
            u.email.includes('karim') || 
            u.email.includes('hiba') ||
            u.roleName === 'ADMIN' ||
            u.roleName === 'DEMANDEUR'
        ).slice(0, 10);

        summaryUsers.forEach(user => {
            const password = 
                user.email.includes('karim') ? '123456' :
                user.email.includes('admin') ? 'admin123' :
                '123';

            console.log(`┌─ ${user.name}`);
            console.log(`│  Email: ${user.email}`);
            console.log(`│  Password: ${password}`);
            console.log(`│  Rôle: ${user.roleName || 'N/A'}`);
            console.log(`└─────────────────────────────────────────────────────`);
            console.log('');
        });

        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

listAllUsers();
