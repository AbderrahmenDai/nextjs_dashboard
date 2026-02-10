
const db = require('../config/db');
const fs = require('fs');

async function checkDuplicateDepartments() {
    let output = "";
    try {
        console.log("Fetching all departments...");
        const [departments] = await db.query('SELECT * FROM Department');
        output += `Total departments found: ${departments.length}\n`;

        const nameCount = {};
        departments.forEach(d => {
            const key = d.name.trim().toLowerCase(); // Normalizing names
            if (!nameCount[key]) {
                nameCount[key] = [];
            }
            nameCount[key].push(d);
        });

        const duplicates = Object.keys(nameCount).filter(key => nameCount[key].length > 1);

        if (duplicates.length === 0) {
            output += "No duplicate departments found.\n";
        } else {
            output += `Found ${duplicates.length} sets of duplicate departments:\n`;
            for (const key of duplicates) {
                output += `\nName: "${key}"\n`;
                const dups = nameCount[key];
                for (const d of dups) {
                    // Check usage counts (simplified)
                    const [userCount] = await db.query('SELECT COUNT(*) as count FROM User WHERE departmentId = ?', [d.id]);
                    const [hrCount] = await db.query('SELECT COUNT(*) as count FROM HiringRequest WHERE departmentId = ?', [d.id]);
                    // Check Candidature if table exists
                    let candCount = 0;
                    try {
                        // Assuming Candidature table exists based on previous context
                        const [cands] = await db.query('SELECT COUNT(*) as count FROM Candidature WHERE departmentId = ?', [d.id]);
                        candCount = cands[0].count;
                    } catch (e) {
                        // Table might not exist or field might be different
                        candCount = "N/A";
                    }

                    output += ` - ID: ${d.id}, SiteID: ${d.siteId}, Users: ${userCount[0].count}, HiringRequests: ${hrCount[0].count}, Candidatures: ${candCount}\n`;
                }
            }
        }

        fs.writeFileSync('backend/duplicate-report.txt', output);
        console.log("Report written to backend/duplicate-report.txt");

    } catch (error) {
        console.error("Error checking duplicates:", error);
    } finally {
        process.exit();
    }
}

checkDuplicateDepartments();
