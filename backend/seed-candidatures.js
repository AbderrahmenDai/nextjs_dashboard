const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedCandidatures() {
    console.log('🌱 Seeding Candidatures from image data...');

    const rawData = [
        // En cours
        { dept: 'RH', pos: 'Chargé de Recrutement', name: 'Amine Ben Salem', gender: 'MALE', source: 'OTHER', date: '2025-01-05', status: 'En cours', hr: 'Passable', manager: 'Passable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Finance', pos: 'Auditeur Junior', name: 'Nadia Khelil', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-02-15', status: 'En cours', hr: 'Favorable', manager: 'En attente', salary: 1800, mode: 'EXTERNAL' },
        { dept: 'IT', pos: 'Développeur Fullstack', name: 'Marwan Jaziri', gender: 'MALE', source: 'WEBSITE', date: '2025-03-10', status: 'En cours', hr: 'Favorable', manager: 'Favorable', salary: 2500, mode: 'EXTERNAL' },

        // Embauché
        { dept: 'RH', pos: 'HR Manager', name: 'Sarah Mansour', gender: 'FEMALE', source: 'REFERRAL', date: '2025-02-06', status: 'Embauché', hr: 'Favorable', manager: 'Favorable', salary: 2400, mode: 'INTERNAL' },
        { dept: 'Production', pos: 'Chef d\'équipe', name: 'Omar Dridi', gender: 'MALE', source: 'REFERRAL', date: '2025-03-02', status: 'Embauché', hr: 'Favorable', manager: 'Prioritaire', salary: 2400, mode: 'INTERNAL' },
        { dept: 'Maintenance', pos: 'Technicien Supérieur', name: 'Walid Jendoubi', gender: 'MALE', source: 'REFERRAL', date: '2025-04-07', status: 'Embauché', hr: 'Favorable', manager: 'Prioritaire', salary: 2100, mode: 'INTERNAL' },

        // Refus du candidat
        { dept: 'Commerce', pos: 'Commercial Terrain', name: 'Salma Hichri', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-01-20', status: 'Refus du candidat', hr: 'Favorable', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'IT', pos: 'DevOps Engineer', name: 'Karim Zghal', gender: 'MALE', source: 'WEBSITE', date: '2025-02-25', status: 'Refus du candidat', hr: 'Prioritaire', manager: 'Favorable', salary: 3000, mode: 'EXTERNAL' },

        // Non embauché
        { dept: 'Production', pos: 'Opérateur', name: 'Fatma Mejri', gender: 'FEMALE', source: 'OTHER', date: '2025-03-03', status: 'Non embauché', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Qualité', pos: 'Contrôleur Qualité', name: 'Ines Ben Amor', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-04-12', status: 'Non embauché', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },

        // Prioritaire
        { dept: 'Finance', pos: 'Directeur Financier', name: 'Yassine Ghorbel', gender: 'MALE', source: 'OTHER', date: '2025-04-04', status: 'Prioritaire', hr: 'Prioritaire', manager: 'Prioritaire', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Direction', pos: 'Assistant de Direction', name: 'Leila Ayari', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-05-09', status: 'Prioritaire', hr: 'Prioritaire', manager: 'Favorable', salary: 1900, mode: 'EXTERNAL' },
        { dept: 'Logistique', pos: 'Supply Chain Manager', name: 'Hamza Riahi', gender: 'MALE', source: 'WEBSITE', date: '2025-06-11', status: 'Prioritaire', hr: 'Prioritaire', manager: 'Prioritaire', salary: 2800, mode: 'EXTERNAL' },

        // En attente
        { dept: 'Logistique', pos: 'Magasinier', name: 'Mariem Toumi', gender: 'FEMALE', source: 'OTHER', date: '2025-05-01', status: 'En attente', hr: 'Passable', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Méthode', pos: 'Technicien Méthodes', name: 'Anis Gharbi', gender: 'MALE', source: 'OTHER', date: '2025-06-15', status: 'En attente', hr: 'Passable', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Qualité', pos: 'Responsable Qualité', name: 'Olfa Hammami', gender: 'FEMALE', source: 'WEBSITE', date: '2025-07-20', status: 'En attente', hr: 'En attente', manager: 'En attente', salary: 0, mode: 'EXTERNAL' }
    ];

    try {
        await db.query('DELETE FROM Candidature'); // Clear existing for clean seed

        for (const c of rawData) {
            const [firstName, ...rest] = c.name.split(' ');
            const lastName = rest.join(' ');

            await db.query(
                `INSERT INTO Candidature (
                    id, firstName, lastName, email, gender, 
                    positionAppliedFor, department, 
                    source, status, hrOpinion, managerOpinion, 
                    proposedSalary, recruitmentMode, createdAt
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    uuidv4(),
                    firstName, 
                    lastName, 
                    `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(/ /g, '')}@example.com`,
                    c.gender,
                    c.pos,
                    c.dept,
                    c.source,
                    c.status,
                    c.hr,
                    c.manager,
                    c.salary,
                    c.mode,
                    c.date // Using application date as createdAt
                ]
            );
        }

        console.log(`✅ Successfully inserted ${rawData.length} candidatures!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding candidatures failed:', error);
        process.exit(1);
    }
}

seedCandidatures();
