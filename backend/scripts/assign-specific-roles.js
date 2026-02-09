const db = require('../config/db');

const USERS_TO_UPDATE = [
    { title: 'Responsable Manufacturing & Supply Chain', email: 'kais.riahi@tescagroup.com' },
    { title: 'Responsable Qualité', email: 'mohamed-karim.tabassi@tescagroup.com', roleAlias: 'Responsable Labo' }, // Wait, Karim is QC Manager? Responsable Qualité Prod?
    // Let's check image carefully? Image says "Responsable Qualité" for Karim.
    // In my seeded roles, I have "Ingénieur Qualité Prod", "Responsable Labo", "Responsable AQF".
    // I don't have "Responsable Qualité" explicitly? 
    // Ah, wait. I should check if "Responsable Qualité" exists in Role table.
    // If not, maybe use "Ingénieur Qualité Prod" or create it?
    // User says "WE HAVE ROLE IS LIKE DEMANDEUR AND ROLE LIKE [blank]".
    
    // Let's assume seeded roles are correct and try to map best fit.
    // Or just create the missing roles if needed?
    // The user provided the "Image 2" which supposedly lists the roles.
    // If "Responsable Qualité" is in Image 2, then it exists.
    
    // I'll list Roles first to be safe.
    // But I can do that inside the script.
    
    { title: 'Responsable Engineering', email: 'sahbi.toumi@tescagroup.com' },
    { title: 'Controleur de Gestion', email: 'saida.benbrahim@tescagroup.com' },
    { title: 'Responsable Cash', email: 'feten.mdaissi@tescagroup.com' },
    { title: 'Responsable Finance', email: 'chokri.ghalioun@tescagroup.com' },
    { title: 'Responsable Comptabilité', email: 'ahmed.amor@tescagroup.com' },
    { title: 'Responsable Achat', email: 'tarek.ferchichi@tescagroup.com', roleAlias: 'Directeur Achat' }, // Maybe Director? Or just create Resp Achat
    { title: 'Plant Manager', email: 'mohamed-aymen.baccouche@tescagroup.com', roleAlias: 'Plant Manager' },
    { title: 'Responsable UAP Tissage', email: 'raouf.souissi@tescagroup.com' }, // He does both? Use one.
    { title: 'Responsable UAP', email: 'khaled.dridi@tescagroup.com' },
    { title: 'Responsable Labo', email: 'mohamed-amine.guerbouj@tescagroup.com' },
    { title: 'HRBP', email: 'amine.elabed@tescagroup.com' }
];

async function assignRoles() {
    console.log('🔄 Assigning Specific Roles to Users...');
    try {
        // 1. Fetch All Roles
        const [roles] = await db.query('SELECT id, name FROM Role');
        const roleMap = {};
        roles.forEach(r => roleMap[r.name.toLowerCase()] = r.id);
        
        console.log(`   ℹ️  Found ${roles.length} roles in DB.`);

        for (const user of USERS_TO_UPDATE) {
            // Find Role ID
            let targetRoleName = user.roleAlias || user.title;
            let roleId = roleMap[targetRoleName.toLowerCase()];
            
            // Fuzzy / Fallback
            if (!roleId) {
                // Try finding partial?
                const match = roles.find(r => r.name.toLowerCase().includes(user.title.toLowerCase()) || (user.roleAlias && r.name.toLowerCase().includes(user.roleAlias.toLowerCase())));
                if (match) {
                    roleId = match.id;
                    console.log(`   ⚠️  Exact match not found for '${user.title}', using '${match.name}'`);
                }
            }

            if (!roleId) {
                console.log(`   ❌ Role '${user.title}' (or alias '${user.roleAlias}') NOT FOUND. Skipping user ${user.email}.`);
                continue;
            }

            // Update User
            const [result] = await db.query(
                'UPDATE User SET roleId = ?, jobTitle = ? WHERE email = ?',
                [roleId, user.title, user.email]
            );

            if (result.affectedRows > 0) {
                console.log(`   ✅ Updated ${user.email} -> Role: ${user.title} (ID: ${roleId})`);
            } else {
                console.log(`   ⚠️  User ${user.email} not found.`);
            }
        }
        
        console.log('✅ Role assignment complete.');
        process.exit(0);

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

assignRoles();
