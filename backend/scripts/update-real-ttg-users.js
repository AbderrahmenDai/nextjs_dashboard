const db = require('../config/db');
const bcrypt = require('bcryptjs');

const REAL_USERS = [
    { title: 'Responsable Manufacturing & Supply Chain', email: 'kais.riahi@tescagroup.com', deptHint: 'Production' }, // or Supply Chain? List said Production previously.
    { title: 'Responsable Qualité', email: 'mohamed-karim.tabassi@tescagroup.com', deptHint: 'Qualité' },
    { title: 'Responsable Engineering', email: 'sahbi.toumi@tescagroup.com', deptHint: 'Engineering' },
    { title: 'Controleur de Gestion', email: 'saida.benbrahim@tescagroup.com', deptHint: 'Finance', match: ['Controleuse de Gestion', 'Controleur de Gestion'] },
    { title: 'Responsable Cash', email: 'feten.mdaissi@tescagroup.com', deptHint: 'Finance' },
    { title: 'Responsable Finance', email: 'chokri.ghalioun@tescagroup.com', deptHint: 'Finance' },
    { title: 'Responsable Comptabilité', email: 'ahmed.amor@tescagroup.com', deptHint: 'Finance', match: ['Responsable comptabilité'] },
    { title: 'Responsable Achat', email: 'tarek.ferchichi@tescagroup.com', deptHint: 'Achat', match: ['Directeur Achat', 'Responsable Achat'] },
    { title: 'Plant Manager', email: 'aymen.baccouche@tescagroup.com', deptHint: 'Direction', match: ['Plant Manager'] }, // Handling split name carefully. Using aymen.baccouche based on typical pattern, user typed 'mohamed-aymen...' in thought but image shows 'mohamed-' line break 'aymen.baccouche'. I'll try 'mohamed-aymen.baccouche' first, or just 'aymen.baccouche'. The text below Plant Manager says 'aymen.baccouche@...'. The 'mohamed-' might be part of it. I'll use 'mohamed-aymen.baccouche@tescagroup.com' to be safe, or check image text closely. Image row: "Plant Manager" -> "mohamed-aymen.baccouche@tescagroup.com".
    { title: 'Responsable UAP Tissage & Finition', email: 'raouf.souissi@tescagroup.com', deptHint: 'Production', match: ['Responsable UAP Tissage', 'Responsable UAP Finition'] },
    { title: 'Responsable UAP', email: 'khaled.drildi@tescagroup.com', deptHint: 'Production' }, // Typo check: image says 'khaled.dridi'. I will use 'khaled.dridi'.
    { title: 'Responsable Labo', email: 'mohamed-amine.guerbouj@tescagroup.com', deptHint: 'Qualité' },
    { title: 'HRBP', email: 'amine.elabed@tescagroup.com', deptHint: 'Ressources Humaines' }
];

// Fix for Plant Manager email based on re-reading: "mohamed-aymen.baccouche"
// Fix for Khaled Dridi
// Fix for Ahmed Amor (Comptablité)

const CLEAN_USERS = [
    { title: 'Responsable Manufacturing & Supply Chain', email: 'kais.riahi@tescagroup.com', dept: 'Production' },
    { title: 'Responsable Qualité', email: 'mohamed-karim.tabassi@tescagroup.com', dept: 'Qualité' }, // Might need to CREATE this if not exists
    { title: 'Responsable Engineering', email: 'sahbi.toumi@tescagroup.com', dept: 'Engineering' },
    { title: 'Controleur de Gestion', email: 'saida.benbrahim@tescagroup.com', dept: 'Finance' }, // Will update existing 'Controleur de Gestion'
    { title: 'Responsable Cash', email: 'feten.mdaissi@tescagroup.com', dept: 'Finance' },
    { title: 'Responsable Finance', email: 'chokri.ghalioun@tescagroup.com', dept: 'Finance' },
    { title: 'Responsable Comptabilité', email: 'ahmed.amor@tescagroup.com', dept: 'Finance' },
    { title: 'Responsable Achat', email: 'tarek.ferchichi@tescagroup.com', dept: 'Achat' },
    { title: 'Plant Manager', email: 'mohamed-aymen.baccouche@tescagroup.com', dept: 'Direction' },
    { title: 'Responsable UAP Tissage & Finition', email: 'raouf.souissi@tescagroup.com', dept: 'Production' },
    { title: 'Responsable UAP', email: 'khaled.dridi@tescagroup.com', dept: 'Production' },
    { title: 'Responsable Labo', email: 'mohamed-amine.guerbouj@tescagroup.com', dept: 'Qualité' },
    { title: 'HRBP', email: 'amine.elabed@tescagroup.com', dept: 'Ressources Humaines' }
];

async function updateUsers() {
    console.log('🔄 Updating TTG Users with Real Data...');
    try {
        const hashedPassword = await bcrypt.hash('123', 10);

        // Get TTG Dept Map
        const [depts] = await db.query("SELECT id, name FROM Department WHERE siteId = 'TTG'");
        const deptMap = {}; // Name -> ID
        depts.forEach(d => deptMap[d.name] = d.id);

        for (const user of CLEAN_USERS) {
            // derive name
            const emailParts = user.email.split('@')[0].split('.');
            // Handle cases with hyphen or multiple parts
            // e.g. mohamed-karim.tabassi -> Mohamed-karim Tabassi
            // e.g. kais.riahi -> Kais Riahi
            let firstName = emailParts[0];
            let lastName = emailParts.length > 1 ? emailParts[1] : '';
            if (firstName.includes('-')) {
                firstName = firstName.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('-');
            } else {
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
            }
            if (lastName) lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
            
            const fullName = `${firstName} ${lastName}`;
            
            // Find Department ID
            // Handle some fuzzy matching for dept names if needed (e.g. 'Ressources Huamine' typo in list vs 'Ressources Humaines' in DB)
            // My seed used correct spelling 'Ressources Humaines'.
            let deptId = deptMap[user.dept];
            if (!deptId) {
                // Try finding close match?
                // For now, assume seed was correct.
                if (user.dept === 'Ressources Humaines' && !deptId) deptId = deptMap['Ressources Huamine']; // check typo
            }
            if (!deptId) {
                console.log(`⚠️  Department '${user.dept}' not found for ${user.email}. Skipping.`);
                continue;
            }

            // Strategy: UPDATE matching Job Title OR INSERT if not found.
            // But we have placeholders like 'Directeur Achat' for 'Responsable Achat'.
            // I'll search by Job Title LIKE...
            
            let targetJobTitle = user.title;
            // Fuzzy match logic
            let searchTitle = user.title;
            if (user.title === 'Responsable Achat') searchTitle = 'Directeur Achat'; // Override
            if (user.title === 'Responsable Comptabilité') searchTitle = 'Responsable comptabilité';
            if (user.title.includes('Tissage & Finition')) searchTitle = 'Responsable UAP Tissage'; // Update one of them

            const [existing] = await db.query(
                "SELECT id FROM User WHERE departmentId = ? AND (jobTitle = ? OR jobTitle = ?)", 
                [deptId, user.title, searchTitle]
            );

            if (existing.length > 0) {
                // Update
                const userId = existing[0].id;
                await db.query(
                    "UPDATE User SET name = ?, email = ?, jobTitle = ? WHERE id = ?",
                    [fullName, user.email, user.title, userId]
                );
                console.log(`   ✏️  Updated ${user.title} -> ${fullName}`);
            } else {
                // Insert
                // Determine Rol
                let role = 'DEMANDEUR';
                const t = user.title.toLowerCase();
                 if (t.includes('directeur') || t.includes('plant manager')) role = 'DIRECTOR';
                else if (t.includes('responsable') || t.includes('hrbp')) role = 'MANAGER'; // HRBP is senior
                
                // Special case for HRBP -> RESPONSABLE_RH?
                if (t === 'hrbp') role = 'RESPONSABLE_RH';

                // Check if email exists (prevent duplicate inserts if running twice)
                const [emailCheck] = await db.query("SELECT id FROM User WHERE email = ?", [user.email]);
                if (emailCheck.length === 0) {
                    await db.query(
                        `INSERT INTO User (id, name, email, password, role, status, departmentId, jobTitle)
                        VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?)`,
                        [fullName, user.email, hashedPassword, role, 'Active', deptId, user.title]
                    );
                    console.log(`   ➕ Created ${fullName} (${user.title})`);
                } else {
                     console.log(`   ℹ️  User ${user.email} already exists.`);
                }
            }
        }
        
        console.log('✅ Update Complete.');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

updateUsers();
