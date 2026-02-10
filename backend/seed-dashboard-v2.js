const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedDashboardData() {
    console.log('🌱 Seeding Dynamic Dashboard Data...');

    try {
        // Fetch departments to use valid IDs
        const [depts] = await db.query('SELECT id, name FROM Department');
        if (depts.length === 0) {
            console.error('❌ No departments found. Please seed departments first.');
            process.exit(1);
        }

        const deptIds = depts.map(d => d.id);
        const deptNames = depts.map(d => d.name);

        // Clear existing data
        await db.query('DELETE FROM Interview');
        await db.query('DELETE FROM Candidature');
        await db.query('DELETE FROM HiringRequest');

        // Update Departments with random stats
        for (const deptId of deptIds) {
            const employeeCount = Math.floor(Math.random() * 50) + 10;
            const budget = Math.floor(Math.random() * 500000) + 100000;
            await db.query('UPDATE Department SET employeeCount = ?, budget = ? WHERE id = ?', [employeeCount, budget, deptId]);
        }

        const positions = [
            'Chargé de Recrutement', 'Chef d\'équipe', 'Comptable', 'Responsable Logistique', 
            'Technicien', 'Ingénieur Qualité', 'Responsable HSE', 'Ingénieur Méthodes',
            'Frontend Dev', 'Backend Dev', 'Fullstack Dev', 'Product Owner', 'Data Analyst'
        ];
        const sources = ['LINKEDIN', 'WEBSITE', 'REFERRAL', 'INDEED', 'OTHER', 'OFFICE_SITE'];
        const statuses = ['NEW', 'SHORTLISTED', 'RH_INTERVIEW', 'TECH_INTERVIEW', 'MANAGER_INTERVIEW', 'OFFER_SENT', 'HIRED', 'REJECTED'];
        const modes = ['EXTERNAL', 'INTERNAL'];
        const genders = ['MALE', 'FEMALE'];

        const months = [
            '2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12',
            '2025-01'
        ];

        let totalCandidatures = 0;

        for (const month of months) {
            // Generate 15-30 candidatures per month
            const count = Math.floor(Math.random() * 16) + 15;
            for (let i = 0; i < count; i++) {
                const id = uuidv4();
                const firstName = ['Jean', 'Marie', 'Pierre', 'Anne', 'Thomas', 'Julie', 'Nicolas', 'Sarah', 'Kamel', 'Ines', 'Yassine', 'Olfa'][Math.floor(Math.random() * 12)];
                const lastName = ['Dupont', 'Martin', 'Bernard', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau', 'Laurent'][Math.floor(Math.random() * 10)];
                const day = Math.floor(Math.random() * 28) + 1;
                const date = `${month}-${day < 10 ? '0' + day : day}`;
                
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const source = sources[Math.floor(Math.random() * sources.length)];
                const mode = modes[Math.floor(Math.random() * modes.length)];
                const deptName = deptNames[Math.floor(Math.random() * deptNames.length)];
                const pos = positions[Math.floor(Math.random() * positions.length)];

                await db.query(
                    `INSERT INTO Candidature (
                        id, firstName, lastName, email, gender, 
                        positionAppliedFor, department, 
                        source, status, hrOpinion, managerOpinion, 
                        proposedSalary, recruitmentMode, createdAt, updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id, firstName, lastName, `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${uuidv4().substring(0,4)}@example.com`,
                        genders[Math.floor(Math.random() * 2)],
                        pos, deptName, source, status,
                        'Good candidate', 'Technical skills match',
                        status === 'HIRED' ? (Math.floor(Math.random() * 1500) + 1500) : 0,
                        mode, date, date
                    ]
                );
                totalCandidatures++;
            }

            // Generate 3-7 Hiring Requests per month
            const hrCount = Math.floor(Math.random() * 5) + 3;
            for (let i = 0; i < hrCount; i++) {
                const id = uuidv4();
                const day = Math.floor(Math.random() * 28) + 1;
                const date = `${month}-${day < 10 ? '0' + day : day}`;
                const status = ['Pending HR', 'Pending Director', 'Approved', 'Rejected'][Math.floor(Math.random() * 4)];
                
                await db.query(
                    `INSERT INTO HiringRequest (
                        id, title, departmentId, status, priority, budget, 
                        reason, contractType, createdAt, updatedAt
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        id, `Request for ${positions[Math.floor(Math.random() * positions.length)]}`,
                        deptIds[Math.floor(Math.random() * deptIds.length)],
                        status,
                        ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)],
                        2000 * (Math.floor(Math.random() * 5) + 1),
                        'Growth', 
                        ['CDI', 'CDD', 'CIVP'][Math.floor(Math.random() * 3)],
                        date, date
                    ]
                );
            }
        }

        console.log(`✅ Successfully inserted ${totalCandidatures} candidatures and updated departments!`);
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedDashboardData();
