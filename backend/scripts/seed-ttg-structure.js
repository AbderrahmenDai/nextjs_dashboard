const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const TTG_STRUCTURE = {
    'Ressources Humaines': [
        'Directeur RH',
        'Responsable Communication et Formation', // Corrected from image typo maybe? Image says "Responsable Communication et Formation"
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
    'Finance': [ // Image has typo "Finace"
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
        'Responsable Aprov',
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
        'Responsable UAP Finition', // Assuming "Fintion" is typo for Finition
        'Superviseur Tissage',
        'Superviseur Finition'
    ],
    'Engineering': [ // Inferred from "ndue & Amelioration Continu" -> "Entendue & Amelioration"? No, likely "Ingénierie & Amélioration Continue" or just "Engineering". I'll use "Engineering".
        'Responsable Engineering',
        'Chef Projet & Amélioration Continue'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

async function seedTTG() {
    console.log('🌱 Seeding TTG Site Structure...');

    try {
        // 1. Ensure Site TTG exists
        await db.query(`INSERT IGNORE INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)`, 
            ['TTG', 'TTG', 3500000.00, 'Global Distribution Center']
        );

        // Password hash
        const hashedPassword = await bcrypt.hash('123', 10);

        for (const [deptName, jobs] of Object.entries(TTG_STRUCTURE)) {
            // 2. Create/Get Department
            // We use a deterministic ID based on Site and Name to avoid duplicates easily or just query names.
            // But here I'll just check by name AND siteId.
            
            // Check if exists
            const [deptRows] = await db.query('SELECT id FROM Department WHERE name = ? AND siteId = ?', [deptName, 'TTG']);
            
            let deptId;
            if (deptRows.length > 0) {
                deptId = deptRows[0].id;
                console.log(`   - Department ${deptName} exists (${deptId}).`);
            } else {
                deptId = uuidv4();
                await db.query(
                    `INSERT INTO Department (id, name, head, location, employeeCount, budget, status, siteId) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [deptId, deptName, 'TBD', 'TTG Main Building', 0, 100000, 'Active', 'TTG']
                );
                console.log(`   + Created Department ${deptName} (${deptId}).`);
            }

            // 3. Create Users for each Job Title
            for (const jobTitle of jobs) {
                // Determine Role based on Title keywords
                let role = 'DEMANDEUR'; // Default
                const titleLower = jobTitle.toLowerCase();
                
                if (titleLower.includes('directeur') || titleLower.includes('plant manager')) role = 'DIRECTOR'; // Or Direction
                else if (titleLower.includes('responsable') || titleLower.includes('chef') || titleLower.includes('manager')) role = 'MANAGER';
                else if (titleLower.includes('rh') || titleLower.includes('hr')) role = 'RESPONSABLE_RH'; // Simple heuristic

                // Generate a dummy email
                // Sanitize title for email
                const sanitizedTitle = titleLower.replace(/[^a-z0-9]/g, '.');
                const email = `${sanitizedTitle}.ttg@tescagroup.com`; // Dummy email
                const name = `${jobTitle} TTG`;

                // Check if user exists (by email)
                const [userRows] = await db.query('SELECT id FROM User WHERE email = ?', [email]);
                
                if (userRows.length === 0) {
                    await db.query(
                        `INSERT INTO User (id, name, email, password, role, status, departmentId, jobTitle)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                        [uuidv4(), name, email, hashedPassword, role, 'Active', deptId, jobTitle]
                    );
                    // console.log(`     + Created User: ${jobTitle}`);
                }
            }
        }

        console.log('✅ TTG Structure Seeding Complete!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding TTG:', error);
        process.exit(1);
    }
}

seedTTG();
