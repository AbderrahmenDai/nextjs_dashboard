const db = require('./config/db');

async function updateSchema() {
    console.log('🔄 Creating HiringRequest table...');
    try {
        const sql = `
            CREATE TABLE IF NOT EXISTS HiringRequest (
                id VARCHAR(50) PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                departmentId VARCHAR(50),
                category VARCHAR(50),
                status VARCHAR(50) DEFAULT 'Pending HR',
                requesterId VARCHAR(50),
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                description TEXT,
                budget DECIMAL(15, 2),
                contractType VARCHAR(50),
                reason TEXT,
                FOREIGN KEY (departmentId) REFERENCES Department(id) ON DELETE SET NULL,
                FOREIGN KEY (requesterId) REFERENCES User(id) ON DELETE SET NULL
            );
        `;
        await db.query(sql);
        console.log('✅ HiringRequest table created.');
        
        // Add foreign key to Candidature if mostly creating cands from reqs
        // (Assuming you might want to link candidates to a request)
        // const addFKSql = "ALTER TABLE Candidature ADD CONSTRAINT fk_hiring_request FOREIGN KEY (hiringRequestId) REFERENCES HiringRequest(id) ON DELETE SET NULL;";
        // await db.query(addFKSql).catch(err => { if(err.code !== 'ER_DUP_KEY' && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') console.log('Info: FK might exist'); });

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to update schema:', error);
        process.exit(1);
    }
}

updateSchema();
