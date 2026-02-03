const db = require('./config/db');

async function checkAdminUsers() {
    try {
        console.log('🔍 Checking for ADMIN users...\n');
        
        const [users] = await db.query(`
            SELECT User.id, User.name, User.email, Role.name as roleName
            FROM User
            LEFT JOIN Role ON User.roleId = Role.id
            WHERE Role.name = 'ADMIN'
        `);
        
        if (users.length === 0) {
            console.log('⚠️  No ADMIN users found!');
            console.log('\n📋 All users with their roles:');
            
            const [allUsers] = await db.query(`
                SELECT User.name, User.email, Role.name as roleName
                FROM User
                LEFT JOIN Role ON User.roleId = Role.id
                ORDER BY User.name
            `);
            
            allUsers.forEach(user => {
                console.log(`  - ${user.name} (${user.email}) - Role: ${user.roleName || 'No role'}`);
            });
        } else {
            console.log(`✅ Found ${users.length} ADMIN user(s):\n`);
            users.forEach(user => {
                console.log(`  - ${user.name} (${user.email})`);
                console.log(`    ID: ${user.id}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAdminUsers();
