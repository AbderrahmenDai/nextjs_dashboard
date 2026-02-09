const db = require('../config/db');

const SYSTEM_ROLES = [
    "Responsable RH", 
    "Responsable Recrutement", 
    "Plant Manager", 
    "Demandeur", 
    "DRH"
];

async function seedSystemRoles() {
    try {
        console.log('🌱 Seeding System Roles...');
        
        // We assume global roles might have NULL departmentId
        // Or we might need to check if they exist under any department?
        // Let's try to insert them as global roles (departmentId = NULL)
        
        for (const roleName of SYSTEM_ROLES) {
            // Check if role exists (globally or just by name)
            // Due to our schema change (unique on name+dept), we can have multiple roles with same name.
            // But for system roles, we usually want a canonical global one?
            // Let's check if a role with this name exists with NULL departmentId.
            
            const [rows] = await db.query('SELECT * FROM Role WHERE name = ? AND departmentId IS NULL', [roleName]);
            
            if (rows.length === 0) {
                const { v4: uuidv4 } = require('uuid');
                const id = uuidv4();
                await db.query(
                    'INSERT INTO Role (id, name, departmentId, description) VALUES (?, ?, ?, ?)',
                    [id, roleName, null, 'System Role']
                );
                console.log(`✅ Created role: ${roleName}`);
            } else {
                console.log(`🔹 Role already exists: ${roleName}`);
            }
        }

        console.log('✨ System roles seeding completed.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to seed system roles:', e);
        process.exit(1);
    }
}

seedSystemRoles();
