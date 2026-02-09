const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const TTG_STRUCTURE = {
    'Ressources Humaines': [
        'Directeur RH',
        'Responsable Communication et Formation',
        'Responsable développement et recrutement',
        'HRBP',
        'Responsable Paie',
        'Chargé RH & HSE',
        'Chargé Formation et juridique'
    ],
    'HSE': [
        'Responsable HSE',
        'Superviseur HSE',
        'Aide Soignant',
        'Infirmier'
    ],
    'Achat': [
        'Directeur Achat',
        'Acheteur Senior',
        'Acheteur Junior'
    ],
    'Finance': [
        'Responsable Comptabilité',
        'Responsable Finance',
        'Comptable Senior',
        'Assistant Controleur de Gestion',
        'Controleur de Gestion',
        'Assistant Responsable Cash',
        'Responsable Cash',
        'Comptable Junior'
    ],
    'Supply Chain': [
        'Responsable Supply Chain',
        'Responsable Approvisionnement',
        'Responsable Planification & Contact Client',
        'PIC-PDP',
        'Responsable Flux & Magasin',
        'Planificateur et Contact Client',
        'Planificateur Prod',
        'Approvisionneur',
        'Superviseur Magasin'
    ],
    'Qualité': [
        'Ingénieur Qualité Prod',
        'Responsable Labo',
        'Responsable AQF'
    ],
    'Production': [
        'Responsable Manufacturing & Supply Chain',
        'Responsable UAP',
        'Responsable UAP Tissage',
        'Responsable UAP Finition',
        'Superviseur Tissage',
        'Superviseur Finition'
    ],
    'Indus & Amélioration Continue': [
        'Responsable Engineering',
        'Chef Projet & Amélioration Continue'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

async function seedRoles() {
    console.log('🔄 Seeding Department Roles...');
    
    // 1. Get Departments from both sites? 
    // The user says "find ony post for department TTG and TT"
    // This implies they want the SAME posts available for the SAME named departments in BOTH sites.
    
    // But our Role schema has a single `departmentId`.
    // If "Finance" department exists in TT (id: 1) and TTG (id: 2).
    // And we have Role "Comptable" (id: A).
    // If Role A has departmentId = 2, it only shows for TTG Finance.
    // If we want it to show for TT Finance too, we have a problem with the current strict 1:1 schema.
    
    // SOLUTION:
    // 1. We should ideally link Role to a "Department Name" or relax the filtering.
    // 2. OR, duplicate roles? "Comptable (TT)" vs "Comptable (TTG)"? User might hate that.
    // 3. OR, Remove `departmentId` from Role and just filter by `department.name` matches?
    //    That would require the frontend to filter Roles by looking up the selected Department's Name, then finding roles that match that Dept Name. (A bit complex for rapid fix).
    
    // QUICK FIX:
    // Drop the foreign key constraint on `Role.departmentId` and make it a loose text reference? 
    // No, better: Make `Role` have a `departmentName` instead of `departmentId`.
    // Then we can filter: `roles.filter(r => r.departmentName === selectedDepartment.name)`
    
    // This allows "Finance" roles to appear for ANY "Finance" department (TT or TTG).
    
    // Plan:
    // 1. Alter Role table: Add `departmentName` column.
    // 2. Populate `departmentName` based on the structure.
    // 3. Update Frontend/Backend filtering to use `departmentName`.
    
    try {
        // Step 1: Add Column if not exists
        const [cols] = await db.query("SHOW COLUMNS FROM Role LIKE 'departmentName'");
        if (cols.length === 0) {
            await db.query("ALTER TABLE Role ADD COLUMN departmentName VARCHAR(191)");
            console.log("✅ Added departmentName to Role table.");
        }
        
        // Step 2: Update Roles with Dept Name
        for (const [deptName, jobTitles] of Object.entries(TTG_STRUCTURE)) {
             for (const title of jobTitles) {
                 // Upsert Role
                 const [existing] = await db.query('SELECT id FROM Role WHERE name = ?', [title]);
                 if (existing.length > 0) {
                     await db.query('UPDATE Role SET departmentName = ? WHERE id = ?', [deptName, existing[0].id]);
                     // console.log(`   Updated Role '${title}' -> DeptName '${deptName}'`);
                 } else {
                     await db.query('INSERT INTO Role (id, name, description, departmentName) VALUES (UUID(), ?, ?, ?)', 
                        [title, title, deptName]
                     );
                     console.log(`   ➕ Created Role: ${title} for ${deptName}`);
                 }
             }
        }
        
        console.log("✅ Roles updated with departmentName.");
        process.exit(0);
        
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedRoles();
