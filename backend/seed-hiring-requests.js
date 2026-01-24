require('dotenv').config();
const db = require('./config/db');
const { v4: uuidv4 } = require('uuid');

async function seed() {
    try {
        console.log('Using DB Connection...');

        // Rebuild Table
        await db.query("DROP TABLE IF EXISTS HiringRequest");
        
        // Verify/Create Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS HiringRequest (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                departmentId VARCHAR(50) NOT NULL,
                requesterId VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Pending HR',
                priority VARCHAR(50) DEFAULT 'Medium',
                budget DECIMAL(15, 2),
                currency VARCHAR(10) DEFAULT 'TND',
                reason TEXT,
                description TEXT,
                contractType VARCHAR(50) DEFAULT 'CDI',
                category VARCHAR(50) DEFAULT 'Cadre',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE CASCADE
            );
        `);
        console.log("HiringRequest table verified/created.");

        const requests = [
            {
                id: uuidv4(),
                title: "Senior Full Stack Developer",
                departmentId: "IT", 
                requesterId: "user1",
                status: "Pending HR",
                priority: "High",
                budget: 50000,
                contractType: "CDI",
                category: "Cadre",
                reason: "Expansion of the digital team",
                description: "Looking for an experienced developer to lead the new project."
            },
            {
                id: uuidv4(),
                title: "Marketing Specialist",
                departmentId: "MKT", 
                requesterId: "user2",
                status: "Approved",
                priority: "Medium",
                budget: 35000,
                contractType: "CDD",
                category: "Etam",
                reason: "Replacement for maternity leave",
                description: "Handle social media and event planning."
            },
            {
                id: uuidv4(),
                title: "HR Assistant",
                departmentId: "HR", 
                requesterId: "user3",
                status: "Pending Director",
                priority: "Low",
                budget: 25000,
                contractType: "Internship",
                category: "Stagiaire",
                reason: "Support for recruitment campaigns",
                description: "Help with sorting CVs and scheduling interviews."
            }
        ];

        /* GET DEPARTMENTS TO ENSURE FK VALIDITY */
        const [depts] = await db.query("SELECT id FROM Department");
        const validDeptIds = depts.map(d => d.id);
        
        if (validDeptIds.length === 0) {
             console.log("No departments found. Seeding skipped.");
             process.exit(0);
        }

        console.log("Seeding Hiring Requests...");

        for (const req of requests) {
            // Assign a random valid department if the hardcoded one doesn't exist?
            // Or just pick the first valid one.
            const deptIdToUse = validDeptIds.includes(req.departmentId) ? req.departmentId : validDeptIds[0];
            
            await db.query(`
                INSERT IGNORE INTO HiringRequest (id, title, departmentId, requesterId, status, priority, budget, contractType, category, reason, description, createdAt, updatedAt)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `, [
                req.id, 
                req.title, 
                deptIdToUse, 
                req.requesterId, 
                req.status, 
                req.priority, 
                req.budget, 
                req.contractType, 
                req.category, 
                req.reason, 
                req.description
            ]);
        }

        console.log('Seeding completed.');
    } catch (error) {
        console.error('Seeding failed:', error);
    } finally {
        process.exit(0);
    }
}

seed();
