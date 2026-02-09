const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');

const SITE_TT_DATA = {
    'Ressources Humaines': [
        'Directeur RH',
        'Responsable RH',
        'Responsable Communication et Formation',
        'Responsable développement et recrutement',
        'HRBP',
        'Responsable Paie',
        'Assistant RH',
        'Chargé Formation et juridique',
        'Cordinateur RH',
        'Chargé RH'
    ],
    'HSE': [
        'Responsable HSE',
        'Superviseur HSE',
        'Aide Soignant', // Corrected from 'Aide Soient'
        'Infirmier' // Corrected from 'Infermier'
    ],
    'Achat': [
        'Responsable Achat',
        'Acheteur Senior',
        'Acheteur Junior'
    ],
    'Finance': [ // Corrected from 'Finace'
        'Responsable comptabilité',
        'Responsable Finance',
        'Comptable Senior',
        'Assistant Controleur de Gestion',
        'Controleur de Gestion',
        'Comptable Junior'
    ],
    'Qualité': [
        'Responsable Qualité',
        'Pilote Qualité UAP',
        'Responsable AQF',
        'Ingénieur AQF',
        'Technicien Qualité système', // Corrected from 'Technicen'
        'Responsable Qualité système',
        'Pilote Qualité Client'
    ],
    'Indus & Amélioration Continue': [
        'Responsable Indus & Amélioration Continue',
        'Responsable méthode & Amelioration continue',
        'Chef Projet Indus',
        'Ingénieur Process',
        'Technicien Indus & Process',
        'Tech CAO',
        'Chef Projet Cost',
        'Pilote Sprint',
        'Key User SAP',
        'Ingénieur Méthode'
    ],
    'Production': [
        'Responsable Production',
        'Responsable UAP Confection',
        'Responsable UAP Coupe',
        'Superviseur Confection',
        'Superviseur Coupe'
    ],
    'Supply Chain': [
        'Responsable Supply Chain',
        'Responsable Approv',
        'Responsable Planification & Contact Client',
        'PIC-PDP',
        'Responsable Flux & Magasin',
        'Planificateur et Contact Client', // Corrected 'Planifacteur'
        'Planificateur Prod', // Corrected 'Planifacteur'
        'Approvisionneur', // Corrected 'Approvisonneur'
        'Superviseur Magasin'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

const SITE_TTG_DATA = {
    'Ressources Humaines': [ // Corrected from 'Huamines'
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
        'Responsable comptabilité',
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
        'Responsable Approv', // Corrected 'Aprov'
        'Responsable Planification & Contact Client',
        'PIC-PDP',
        'Responsable Flux & Magasin',
        'Planificateur et Contact Client',
        'Planificateur Prod',
        'Approvisionneur',
        'Superviseur Magasin'
    ],
    'Qualité': [
        'Ing Qualité Prod',
        'Responsable Labo',
        'Responsable AQF'
    ],
    'Production': [
        'Responsable Manufacturing & Supply Chain',
        'Responsable UAP',
        'Responsable UAP Tissage',
        'Responsable UAP Finition', // Corrected 'Fintion'
        'Superviseur Tissage',
        'Superviseur Finition' // Corrected 'Finition'
    ],
    'Indus & Amélioration Continue': [
        'Responsable Engineering',
        'Chef Projet & Amélioration Continue'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

async function seedData() {
    console.log('🌱 Starting Seed Process for Sites TT and TTG...');

    try {
        await processSite('TT', SITE_TT_DATA);
        await processSite('TTG', SITE_TTG_DATA);
        console.log('✅ All data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

async function processSite(siteId, data) {
    console.log(`\n🏢 Processing Site: ${siteId}`);

    // Ensure Site exists
    const [sites] = await db.query('SELECT * FROM Site WHERE id = ?', [siteId]);
    if (sites.length === 0) {
        await db.query('INSERT INTO Site (id, name, description) VALUES (?, ?, ?)', [siteId, `Site ${siteId}`, `Site ${siteId} Operations`]);
        console.log(`   ➕ Created Missing Site: ${siteId}`);
    }

    // Process Departments
    for (const [deptName, roles] of Object.entries(data)) {
        let deptId;
        
        // Check Dept
        const [depts] = await db.query('SELECT id FROM Department WHERE name = ? AND siteId = ?', [deptName, siteId]);
        
        if (depts.length > 0) {
            deptId = depts[0].id;
            console.log(`   🔹 Found Dept: ${deptName}`);
        } else {
            deptId = uuidv4();
            // Added 'location' field, defaulting to siteId
            // Added 'budget' field, defaulting to 0
            await db.query(
                'INSERT INTO Department (id, name, siteId, location, budget) VALUES (?, ?, ?, ?, ?)', 
                [deptId, deptName, siteId, siteId, 0] // budget = 0
            );
            console.log(`   ➕ Created Dept: ${deptName}`);
        }

        // Process Roles
        for (const roleName of roles) {
            // Check Role (unique by name within department? Or just by name globally linked to dept?)
            // Usually Role names are unique per Department
            const [existingRoles] = await db.query('SELECT id FROM Role WHERE name = ? AND departmentId = ?', [roleName, deptId]);
            
            if (existingRoles.length === 0) {
                const roleId = uuidv4();
                await db.query('INSERT INTO Role (id, name, departmentId) VALUES (?, ?, ?)', [roleId, roleName, deptId]);
                console.log(`      ➕ Created Role: ${roleName}`);
            } else {
                // console.log(`      🔹 Role Exists: ${roleName}`);
            }
        }
    }
}

seedData();
