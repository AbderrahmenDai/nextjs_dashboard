const db = require('./config/db');

async function updateSchemaInterviews() {
    console.log('🔄 Updating Schema for Interviews...');
    try {
        const createTableSql = `
            CREATE TABLE IF NOT EXISTS Interview (
                id VARCHAR(36) PRIMARY KEY,
                candidatureId VARCHAR(36) NOT NULL,
                interviewerId VARCHAR(36),
                date DATETIME NOT NULL,
                mode VARCHAR(50) DEFAULT 'Face-to-Face',
                status VARCHAR(50) DEFAULT 'Scheduled',
                notes TEXT,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (candidatureId) REFERENCES Candidature(id) ON DELETE CASCADE
            )
        `;

        await db.query(createTableSql);
        console.log('✅ Interview table created successfully.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchemaInterviews();
