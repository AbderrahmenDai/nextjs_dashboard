
const db = require('../config/db');

async function migrate() {
    try {
        console.log("🛠️  Starting Schema Restore (Drop & Create)...");

        // Disable FK checks to allow dropping tables
        await db.query('SET FOREIGN_KEY_CHECKS = 0');
        
        console.log("Dropping tables...");
        await db.query('DROP TABLE IF EXISTS Interview');
        await db.query('DROP TABLE IF EXISTS Candidature');
        await db.query('DROP TABLE IF EXISTS HiringRequest');
        await db.query('DROP TABLE IF EXISTS Notification');
        // Do NOT drop User, Role, Department, Site if they are fine. 
        // But if I want to ensure Role/User consistency?
        // My previous steps fixed User and Role/Department. I should keep them.
        
        await db.query('SET FOREIGN_KEY_CHECKS = 1');

        // 1. Notification
        console.log("Creating Notification table...");
        await db.query(`
            CREATE TABLE Notification (
                id VARCHAR(191) NOT NULL,
                senderId VARCHAR(191),
                receiverId VARCHAR(191) NOT NULL,
                message VARCHAR(191) NOT NULL,
                type VARCHAR(191) NOT NULL DEFAULT 'INFO',
                isRead BOOLEAN NOT NULL DEFAULT FALSE,
                entityId VARCHAR(191),
                entityType VARCHAR(191),
                actions JSON,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                PRIMARY KEY (id),
                INDEX Notification_receiverId_idx (receiverId),
                FOREIGN KEY (senderId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY (receiverId) REFERENCES User(id) ON DELETE CASCADE ON UPDATE CASCADE
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // 2. HiringRequest
        console.log("Creating HiringRequest table...");
        await db.query(`
            CREATE TABLE HiringRequest (
                id VARCHAR(191) NOT NULL,
                title VARCHAR(191) NOT NULL,
                departmentId VARCHAR(191),
                category VARCHAR(191),
                status VARCHAR(191) NOT NULL DEFAULT 'Pending HR',
                requesterId VARCHAR(191),
                approverId VARCHAR(191),
                description TEXT,
                budget DOUBLE,
                contractType VARCHAR(191),
                reason TEXT,
                site VARCHAR(191),
                businessUnit VARCHAR(191),
                desiredStartDate DATETIME(3),
                replacementFor VARCHAR(191),
                replacementReason VARCHAR(191),
                increaseType VARCHAR(191),
                increaseDateRange VARCHAR(191),
                educationRequirements TEXT,
                skillsRequirements TEXT,
                rejectionReason TEXT,
                approvedAt DATETIME(3),
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                roleId VARCHAR(191),
                priority VARCHAR(191), -- Added based on seed script usage
                PRIMARY KEY (id),
                INDEX HiringRequest_departmentId_idx (departmentId),
                INDEX HiringRequest_requesterId_idx (requesterId),
                FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY (requesterId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY (approverId) REFERENCES User(id) ON DELETE SET NULL ON UPDATE CASCADE
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // 3. Candidature
        console.log("Creating Candidature table...");
        await db.query(`
            CREATE TABLE Candidature (
                id VARCHAR(191) NOT NULL,
                firstName VARCHAR(191),
                lastName VARCHAR(191),
                email VARCHAR(191),
                phone VARCHAR(191),
                birthDate DATETIME(3),
                gender VARCHAR(191),
                address VARCHAR(191),
                positionAppliedFor VARCHAR(191),
                department VARCHAR(191), -- String name from Service
                specialty VARCHAR(191),
                level VARCHAR(191),
                yearsOfExperience INT,
                language VARCHAR(191),
                source VARCHAR(191),
                status VARCHAR(191) NOT NULL DEFAULT 'NEW',
                hiringRequestId VARCHAR(191),
                departmentId VARCHAR(191), -- FK
                recruiterComments TEXT,
                educationLevel VARCHAR(191),
                familySituation VARCHAR(191),
                studySpecialty VARCHAR(191),
                currentSalary DOUBLE,
                salaryExpectation DOUBLE,
                proposedSalary DOUBLE,
                noticePeriod VARCHAR(191),
                hrOpinion VARCHAR(191),
                managerOpinion VARCHAR(191),
                recruitmentMode VARCHAR(191),
                workSite VARCHAR(191),
                cvFile VARCHAR(191), -- Used in Prisma schema
                cvPath VARCHAR(191), -- Used in Service
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
                details JSON,
                hireDate DATETIME(3),
                PRIMARY KEY (id),
                INDEX Candidature_hiringRequestId_idx (hiringRequestId),
                INDEX Candidature_departmentId_idx (departmentId),
                FOREIGN KEY (hiringRequestId) REFERENCES HiringRequest(id) ON DELETE SET NULL ON UPDATE CASCADE,
                FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE SET NULL ON UPDATE CASCADE
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        // 4. Interview
        console.log("Creating Interview table...");
        await db.query(`
            CREATE TABLE Interview (
                id VARCHAR(191) NOT NULL,
                candidatureId VARCHAR(191) NOT NULL,
                date DATETIME(3) NOT NULL,
                type VARCHAR(191),
                status VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
                notes TEXT,
                interviewers JSON,
                createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
                PRIMARY KEY (id),
                INDEX Interview_candidatureId_idx (candidatureId),
                FOREIGN KEY (candidatureId) REFERENCES Candidature(id) ON DELETE CASCADE ON UPDATE CASCADE
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        `);

        console.log("✅ Schema Restored successfully.");

    } catch (e) {
        console.error("❌ Migration Error:", e);
    } finally {
        process.exit();
    }
}

migrate();
