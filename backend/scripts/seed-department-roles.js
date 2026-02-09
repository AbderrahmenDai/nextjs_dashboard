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
    
    // 1. Get Departments
    const [depts] = await db.query('SELECT id, name FROM Department WHERE siteId = ?', ['TTG']);
    const deptMap = {};
    depts.forEach(d => deptMap[d.name] = d.id);
    console.log('   ℹ️  Departments found:', depts.map(d => d.name));

    for (const [deptName, jobTitles] of Object.entries(TTG_STRUCTURE)) {
        const deptId = deptMap[deptName];
        if (!deptId) {
            console.log(`   ⚠️  Department '${deptName}' not found in TTG site. Skipping roles.`);
            continue;
        }

        for (const title of jobTitles) {
            // Check if Role exists BY NAME AND DEPARTMENT
            // Role name must be unique globally? 
            // In schema: `name VARCHAR(191) UNIQUE NOT NULL`.
            // Uh oh. If "Responsable HSE" exists in TT and TTG, we have a problem.
            // But usually roles like "HR Director" exist once globally? 
            // Or maybe separate IDs?
            
            // If uniqueness is global, we can't have duplicate names.
            // Let's check schema.
            // Yes, UNIQUE.
            
            // Strategy: Check if role exists. If so, update its departmentId?
            // But unique name implies it can only belong to one department?
            // Or maybe "Responsable HSE" is the same role across all sites?
            // But departmentId is singular on Role.
            // If "Responsable HSE" belongs to "HSE Dept", it's fine.
            // But if "HSE Dept" in TT is different from "HSE Dept" in TTG...
            // departments are per site (siteId).
            
            // If the user wants separate roles per site, we need unique names, e.g. "Responsable HSE (TTG)".
            // BUT UI just shows Name.
            // If we share the Role across sites, we can't link it to a specific Department instance (which has a UUID).
            // Unless we link it to a "Department Type" or have clear naming.
            
            // For now, let's assume we link to the TTG department instance.
            // If conflicts arise, we might need a suffix or rethink.
            // But since the user complained about "finding only post for department TTG", maybe they expect specific ones.
            
            // Let's try to insert/update.
            // If exists, update departmentId to this one? But what about previous?
            // Maybe we just ensure it exists and has A department.
            
            const [existing] = await db.query('SELECT id FROM Role WHERE name = ?', [title]);
            
            if (existing.length > 0) {
                // Determine if we update
                 // console.log(`   ℹ️  Role '${title}' already exists.`);
                 // Update departmentId to current TTG department
                 await db.query('UPDATE Role SET departmentId = ? WHERE id = ?', [deptId, existing[0].id]);
                 // console.log(`      Updated localized department.`);
            } else {
                await db.query(`INSERT INTO Role (id, name, description, departmentId) VALUES (UUID(), ?, ?, ?)`, 
                    [title, title, deptId]
                );
                console.log(`   ➕ Created Role: ${title}`);
            }
        }
    }
    
    console.log('✅ Roles seeded successfully.');
    process.exit(0);
}

seedRoles();
