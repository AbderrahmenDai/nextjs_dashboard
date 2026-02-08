const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

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
        'Responsable UAP Finition',
        'Superviseur Tissage',
        'Superviseur Finition'
    ],
    'Engineering': [ 
        'Responsable Engineering',
        'Chef Projet & Amélioration Continue'
    ],
    'Direction': [
        'Plant Manager'
    ]
};

async function resetAndSeedTTG() {
    console.log('🧹 Formatting TTG Site Data...');

    let conn;
    try {
        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Find all Department IDs for TTG
        const [deptRows] = await conn.query("SELECT id FROM Department WHERE siteId = 'TTG'");
        const deptIds = deptRows.map(d => d.id);

        if (deptIds.length > 0) {
            // 2. Delete Users in these departments
            const placeHolders = deptIds.map(() => '?').join(',');
            
            // Note: Use DELETE JOIN or simpler Two-Step
            // Delete Users
            console.log(`   - Deleting Users in ${deptIds.length} departments...`);
            await conn.query(`DELETE FROM User WHERE departmentId IN (${placeHolders})`, deptIds);

            // 3. Delete Departments
            console.log(`   - Deleting Departments...`);
            await conn.query(`DELETE FROM Department WHERE id IN (${placeHolders})`, deptIds);
        }

        // 4. Ensure Site TTG
        await conn.query(`INSERT IGNORE INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)`, 
            ['TTG', 'TTG', 3500000.00, 'Global Distribution Center']
        );

        const hashedPassword = await bcrypt.hash('123', 10);

        // 5. Re-Seed
        console.log('🌱 Seeding Clean TTG Structure...');
        for (const [deptName, jobs] of Object.entries(TTG_STRUCTURE)) {
            const deptId = uuidv4();
            
            // Create Dept
            await conn.query(
                `INSERT INTO Department (id, name, head, location, employeeCount, budget, status, siteId) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [deptId, deptName, 'TBD', 'TTG Main Building', jobs.length, 100000, 'Active', 'TTG']
            );
            
            // Create Users
            for (const jobTitle of jobs) {
                let role = 'DEMANDEUR';
                const titleLower = jobTitle.toLowerCase();
                
                if (titleLower.includes('directeur') || titleLower.includes('plant manager')) role = 'DIRECTOR';
                else if (titleLower.includes('responsable') || titleLower.includes('manager')) role = 'MANAGER';
                else if (titleLower.includes('rh') || titleLower.includes('hr')) role = 'RESPONSABLE_RH';

                const sanitizedTitle = titleLower.replace(/[^a-z0-9]/g, '.');
                const email = `${sanitizedTitle}.ttg@tescagroup.com`;
                const name = `${jobTitle} TTG`;

                await conn.query(
                    `INSERT INTO User (id, name, email, password, role, status, departmentId, jobTitle)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [uuidv4(), name, email, hashedPassword, role, 'Active', deptId, jobTitle]
                );
            }
        }

        await conn.commit();
        console.log('✅ TTG Reset & Seed Complete!');
        process.exit(0);

    } catch (error) {
        if (conn) await conn.rollback();
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        if (conn) conn.release();
    }
}

resetAndSeedTTG();
