const db = require('../config/db');

async function debugRoleSearch() {
    try {
        console.log('🔍 Debugging Role Search Logic...');

        // 1. Run the EXACT query from controller
        const [hrUsers] = await db.query(
            `SELECT User.id, User.name, Role.name as roleName FROM User 
             JOIN Role ON User.roleId = Role.id 
             WHERE Role.name LIKE 'Responsable RH%' OR Role.name = 'HR_MANAGER'` 
        );

        console.log(`Query returned ${hrUsers.length} users.`);
        
        // 2. Check for "Responsable RH" specifically
        const specificRH = hrUsers.filter(u => u.roleName.trim() === 'Responsable RH');
        console.log(`Filtered 'Responsable RH' users: ${specificRH.length}`);
        
        if (specificRH.length > 0) {
            console.log('✅ Found specific Responsable RH users:', specificRH.map(u => u.name));
            console.log('Controller WOULD notify these users.');
        } else {
            console.log('❌ NO specific Responsable RH found.');
            console.log('Controller WOULD notify ALL these users:', hrUsers.map(u => `${u.name} (${u.roleName})`).join(', '));
        }

        // 3. Dump all users with "Responsable" in role to see what we have
        const [allResponsables] = await db.query(`
            SELECT User.name, Role.name as roleName 
            FROM User 
            JOIN Role ON User.roleId = Role.id 
            WHERE Role.name LIKE '%Responsable%'
        `);
        console.log('\n--- All Users with "Responsable" in Role ---');
        console.log(allResponsables.map(u => `${u.name}: ${u.roleName}`).join('\n'));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

debugRoleSearch();
