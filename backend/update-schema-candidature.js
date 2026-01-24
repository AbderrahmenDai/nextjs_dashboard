const db = require('./config/db');

async function updateSchema() {
    console.log('🔄 Updating Schema for Candidature...');
    try {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS Candidature (
                id VARCHAR(36) PRIMARY KEY,
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                birthDate DATETIME,
                gender ENUM('MALE', 'FEMALE', 'OTHER') DEFAULT 'MALE',
                address TEXT,
                
                positionAppliedFor VARCHAR(255),
                department VARCHAR(255),
                specialty VARCHAR(255),
                level VARCHAR(100),
                yearsOfExperience INT DEFAULT 0,
                language VARCHAR(255),
                
                source VARCHAR(100) DEFAULT 'WEBSITE',
                hiringRequestId VARCHAR(100),
                recruiterComments TEXT,
                
                educationLevel VARCHAR(255),
                familySituation VARCHAR(255),
                studySpecialty VARCHAR(255),
                currentSalary DECIMAL(15, 2) DEFAULT 0,
                salaryExpectation DECIMAL(15, 2) DEFAULT 0,
                proposedSalary DECIMAL(15, 2) DEFAULT 0,
                noticePeriod VARCHAR(100),
                hrOpinion TEXT,
                managerOpinion TEXT,
                recruitmentMode VARCHAR(100) DEFAULT 'EXTERNAL',
                workSite VARCHAR(255),
                
                status VARCHAR(50) DEFAULT 'New',
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;

        await db.query(createTableSql);
        console.log('✅ Candidature table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchema();
