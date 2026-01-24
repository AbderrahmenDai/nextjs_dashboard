const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedCandidatures() {
    console.log('🌱 Seeding Candidatures from image data...');

    const rawData = [
        { dept: 'RH', pos: 'Chargé de Recrutement', name: 'Amine Ben Salem', gender: 'MALE', source: 'OTHER', date: '2025-01-05', status: 'In Progress', hr: 'Passable', manager: 'Passable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'RH', pos: 'Chargé de Recrutement', name: 'Sarah Mansour', gender: 'FEMALE', source: 'REFERRAL', date: '2025-02-06', status: 'Hired', hr: 'Favorable', manager: 'Favorable', salary: 2400, mode: 'INTERNAL' },
        { dept: 'Production', pos: 'Chef d\'équipe', name: 'Omar Dridi', gender: 'MALE', source: 'REFERRAL', date: '2025-03-02', status: 'Hired', hr: 'Favorable', manager: 'Prioritaire', salary: 2400, mode: 'INTERNAL' },
        { dept: 'Production', pos: 'Chef d\'équipe', name: 'Fatma Mejri', gender: 'FEMALE', source: 'OTHER', date: '2025-03-03', status: 'Rejected', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Finance', pos: 'Comptable', name: 'Yassine Ghorbel', gender: 'MALE', source: 'OTHER', date: '2025-04-04', status: 'Shortlisted', hr: 'Prioritaire', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Logistique', pos: 'Responsable Logistique', name: 'Mariem Toumi', gender: 'FEMALE', source: 'OTHER', date: '2025-05-01', status: 'Pending', hr: 'Passable', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Finance', pos: 'Comptable', name: 'Sonia Kasraoui', gender: 'FEMALE', source: 'REFERRAL', date: '2025-06-05', status: 'Hired', hr: 'Favorable', manager: 'Favorable', salary: 2000, mode: 'INTERNAL' },
        { dept: 'Maintenance', pos: 'Technicien', name: 'Walid Jendoubi', gender: 'MALE', source: 'REFERRAL', date: '2025-04-07', status: 'Hired', hr: 'Favorable', manager: 'Prioritaire', salary: 2100, mode: 'INTERNAL' },
        { dept: 'Qualité', pos: 'Ingénieur Qualité', name: 'Ines Ben Amor', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-07-03', status: 'Rejected', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Production', pos: 'Chef d\'équipe', name: 'Sami Kallel', gender: 'MALE', source: 'LINKEDIN', date: '2025-05-04', status: 'Hired', hr: 'Favorable', manager: 'Prioritaire', salary: 1800, mode: 'EXTERNAL' },
        { dept: 'HSE', pos: 'Responsable HSE', name: 'Mourad Nefzi', gender: 'MALE', source: 'OTHER', date: '2025-08-02', status: 'Shortlisted', hr: 'Prioritaire', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'RH', pos: 'Chargé de Recrutement', name: 'Leila Ayari', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-09-06', status: 'Shortlisted', hr: 'Prioritaire', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Logistique', pos: 'Responsable Logistique', name: 'Hamza Riahi', gender: 'MALE', source: 'WEBSITE', date: '2025-10-01', status: 'Shortlisted', hr: 'Prioritaire', manager: 'Prioritaire', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Méthode', pos: 'Ingénieur Méthodes', name: 'Anis Gharbi', gender: 'MALE', source: 'OTHER', date: '2025-08-05', status: 'Pending', hr: 'Passable', manager: 'Favorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Maintenance', pos: 'Technicien', name: 'Zied Bacha', gender: 'MALE', source: 'OTHER', date: '2025-09-07', status: 'Pending', hr: 'Passable', manager: 'Prioritaire', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Qualité', pos: 'Ingénieur Qualité', name: 'Olfa Hammami', gender: 'FEMALE', source: 'WEBSITE', date: '2025-05-03', status: 'Rejected', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Finance', pos: 'Comptable', name: 'Kais Slimane', gender: 'MALE', source: 'OTHER', date: '2025-07-04', status: 'Rejected', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'Production', pos: 'Chef d\'équipe', name: 'Houda Tounsi', gender: 'FEMALE', source: 'OTHER', date: '2025-12-03', status: 'Rejected', hr: 'Defavorable', manager: 'Defavorable', salary: 0, mode: 'EXTERNAL' },
        { dept: 'HSE', pos: 'Responsable HSE', name: 'Mehdi Zaibi', gender: 'MALE', source: 'REFERRAL', date: '2025-11-02', status: 'Hired', hr: 'Favorable', manager: 'Passable', salary: 2200, mode: 'INTERNAL' },
        { dept: 'Méthode', pos: 'Ingénieur Méthodes', name: 'Rim Sassi', gender: 'FEMALE', source: 'LINKEDIN', date: '2025-10-05', status: 'In Progress', hr: 'Prioritaire', manager: 'Passable', salary: 0, mode: 'EXTERNAL' }
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
