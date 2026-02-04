const db = require('./config/db');

async function checkRoles() {
    console.log('🔍 Vérification des rôles pour Zoubaier et Karim...');

    try {
        const [users] = await db.query(`
            SELECT u.name, u.email, r.name as roleName 
            FROM User u 
            LEFT JOIN Role r ON u.roleId = r.id
            WHERE u.email LIKE '%zoubaier%' OR u.email LIKE '%karim%'
        `);

        console.log(JSON.stringify(users, null, 2));
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

checkRoles();
