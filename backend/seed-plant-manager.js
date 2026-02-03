const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

async function seedPlantManager() {
    try {
        console.log('🌱 Seeding Plant Manager...');

        // 1. Ensure Role 'PLANT_MANAGER' exists
        let roleId;
        const [roles] = await db.query("SELECT id FROM Role WHERE name = 'PLANT_MANAGER'");
        
        if (roles.length > 0) {
            roleId = roles[0].id;
            console.log('✅ Role PLANT_MANAGER already exists.');
        } else {
            roleId = uuidv4();
            await db.query("INSERT INTO Role (id, name) VALUES (?, ?)", [roleId, 'PLANT_MANAGER']);
            console.log('✅ Created role PLANT_MANAGER.');
        }

        // 2. Ensure User 'karim.mani@tescagroup.com' exists
        const email = 'karim.mani@tescagroup.com';
        const [users] = await db.query("SELECT id FROM User WHERE email = ?", [email]);

        if (users.length > 0) {
            // Update existing user to be PLANT_MANAGER
            await db.query("UPDATE User SET roleId = ? WHERE id = ?", [roleId, users[0].id]);
            console.log(`✅ Updated existing user ${email} to PLANT_MANAGER.`);
        } else {
            // Create new user
            const userId = uuidv4();
            const hashedPassword = await bcrypt.hash('123456', 10); // Default password
            // Assume we need a valid department. I'll pick one or leave null if allowed, but schema usually requires it.
            // I'll try to find a default department or create one if needed, but for now let's hope 'Direction' or similar exists, or use the first one found.
            
            let deptId = null;
            const [depts] = await db.query("SELECT id FROM Department LIMIT 1");
            if (depts.length > 0) deptId = depts[0].id;

            await db.query(`
                INSERT INTO User (id, name, email, password, roleId, status, avatarGradient, departmentId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                userId, 
                'Karim Mani', 
                email, 
                hashedPassword, 
                roleId, 
                'Active', 
                'from-green-500 to-emerald-700', 
                deptId
            ]);
            console.log(`✅ Created user ${email} as PLANT_MANAGER.`);
        }

        console.log('🎉 Seeding complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding Plant Manager:', error);
        process.exit(1);
    }
}

seedPlantManager();
