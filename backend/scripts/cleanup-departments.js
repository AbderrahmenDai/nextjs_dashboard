
const db = require('../config/db');

async function cleanupDepartments() {
    try {
        console.log("Starting Department Cleanup...");

        // 1. Fetch all departments
        const [departments] = await db.query('SELECT * FROM Department');
        
        // 2. Group by Normalized Name
        const nameMap = {};
        departments.forEach(d => {
            const name = d.name.trim().toLowerCase();
            if (!nameMap[name]) nameMap[name] = [];
            nameMap[name].push(d);
        });

        // 3. Process Duplicates
        for (const name of Object.keys(nameMap)) {
            const group = nameMap[name];
            if (group.length > 1) {
                console.log(`Processing duplicate group: "${name}" (${group.length} entries)`);

                // Pick Winner: Prefer TTG if available, else first one
                let winner = group.find(d => d.siteId === 'TTG') || group[0];
                const losers = group.filter(d => d.id !== winner.id);

                console.log(` -> Winner: ${winner.id} (${winner.siteId})`);

                for (const loser of losers) {
                    console.log(`    -> Merging ${loser.id} (${loser.siteId}) into Winner...`);
                    
                    // Update Users
                    const [uRes] = await db.query('UPDATE User SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
                    console.log(`       - Users moved: ${uRes.affectedRows}`);

                    // Update HiringRequests
                    const [hRes] = await db.query('UPDATE HiringRequest SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
                    console.log(`       - HiringRequests moved: ${hRes.affectedRows}`);

                    // Update Candidatures (if table exists)
                    try {
                         const [cRes] = await db.query('UPDATE Candidature SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
                         console.log(`       - Candidatures moved: ${cRes.affectedRows}`);
                    } catch (e) {
                        console.log(`       - Candidature table skipped (or error): ${e.message}`);
                    }

                    // Delete Loser
                    await db.query('DELETE FROM Department WHERE id = ?', [loser.id]);
                    console.log(`       - Deleted Department: ${loser.id}`);
                }
            }
        }

        console.log("Cleanup Complete.");
    } catch (error) {
        console.error("Cleanup Failed:", error);
    } finally {
        process.exit();
    }
}

cleanupDepartments();
