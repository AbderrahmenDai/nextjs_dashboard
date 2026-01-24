require('dotenv').config();
const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seedCompleteData() {
    try {
        console.log('🌱 Seeding Complete Data (Candidates + Interviews)...');

        // 1. Ensure basic data exists (Users)
        const [users] = await db.query("SELECT id, role FROM User");
        let interviewers = users;
        
        if (users.length < 3) {
             console.log("Not enough users. Creating some...");
             // Create mock users for seeding
             const newUsers = [
                 { id: uuidv4(), name: "Alice HR", role: "HR_MANAGER" },
                 { id: uuidv4(), name: "Bob Tech", role: "TECH_LEAD" },
                 { id: uuidv4(), name: "Charlie Manager", role: "DIRECTOR" }
             ];
             for(const u of newUsers) {
                 await db.query(`INSERT IGNORE INTO User (id, name, email, role) VALUES (?, ?, ?, ?)`, [u.id, u.name, `seed_${u.id}@test.com`, u.role]);
             }
             interviewers = newUsers;
        }

        // 2. Clear old candidates to restart fresh? Or just add new ones.
        // Let's add 5 new candidates with varied interview states.
        
        const candidates = [
            {
                firstName: 'John', lastName: 'Doe', email: 'john.doe@test.com', 
                position: 'Frontend Dev', finalDecision: 'Pending', status: 'In Progress', hasInterview: true,
                interviews: [
                    { type: 'RH', result: 'Passed', notes: 'Good cultural fit.' },
                    { type: 'Technique', result: 'Pending', notes: 'Scheduled for next week.' }
                ]
            },
            {
                firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@test.com',
                position: 'Backend Dev', finalDecision: 'Hired', status: 'Hired', hasInterview: true,
                interviews: [
                    { type: 'RH', result: 'Passed', notes: 'Excellent.' },
                    { type: 'Technique', result: 'Passed', notes: 'Strong Node.js skills.' },
                    { type: 'Manager', result: 'Passed', notes: 'Approved.' },
                    { type: 'Validation', result: 'Passed', notes: 'Offer sent.' }
                ]
            },
            {
                firstName: 'Mike', lastName: 'Johnson', email: 'mike.j@test.com',
                position: 'Product Owner', finalDecision: 'Rejected', status: 'Rejected', hasInterview: true,
                interviews: [
                    { type: 'RH', result: 'Passed', notes: 'Okay.' },
                    { type: 'Technique', result: 'Failed', notes: 'Lack of experience with agile at scale.' }
                ]
            },
            {
                firstName: 'Sarah', lastName: 'Connor', email: 'sarah.c@test.com',
                position: 'Security Expert', finalDecision: 'Pending', status: 'New', hasInterview: false,
                interviews: []
            }
        ];

        for (const cand of candidates) {
            const candId = uuidv4();
            
            // Insert Candidature
            await db.query(`
                INSERT INTO Candidature (
                    id, firstName, lastName, email, positionAppliedFor, 
                    status, finalDecision, hasInterview, 
                    hrOpinion, technicalOpinion, managerOpinion, validationOpinion
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                candId, cand.firstName, cand.lastName, cand.email, cand.position,
                cand.status, cand.finalDecision, cand.hasInterview,
                cand.interviews.find(i => i.type === 'RH')?.notes || null,
                cand.interviews.find(i => i.type === 'Technique')?.notes || null,
                cand.interviews.find(i => i.type === 'Manager')?.notes || null,
                cand.interviews.find(i => i.type === 'Validation')?.notes || null
            ]);

            // Insert Interviews
            for (const interview of cand.interviews) {
                const interviewId = uuidv4();
                const interviewer = interviewers[Math.floor(Math.random() * interviewers.length)];
                
                await db.query(`
                    INSERT INTO Interview (
                        id, candidatureId, interviewerId, date, mode, type, status, result, notes
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    interviewId, candId, interviewer.id, new Date(), 
                    'Face-to-Face', interview.type, 
                    interview.result === 'Pending' ? 'Scheduled' : 'Completed',
                    interview.result, 
                    interview.notes
                ]);
            }
        }

        console.log('✅ Seeding candidates and interviews completed.');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seedCompleteData();
