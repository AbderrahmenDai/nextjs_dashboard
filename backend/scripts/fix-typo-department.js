
const db = require('../config/db');

async function fixTypo() {
    try {
        console.log("Fixing 'ressources huamines' typo...");
        
        // Find typo department
        const [typoDepts] = await db.query('SELECT * FROM Department WHERE name LIKE "%huamines%"');
        // Find correct department
        const [correctDepts] = await db.query('SELECT * FROM Department WHERE name LIKE "%humaines%"');
        
        if (typoDepts.length === 0) {
            console.log("No departments with typo found.");
            return;
        }

        if (correctDepts.length === 0) {
            console.log("Found typo but no correct department to merge into. Renaming typo instead.");
            for (const d of typoDepts) {
                await db.query('UPDATE Department SET name = ? WHERE id = ?', ["Ressources Humaines", d.id]);
                console.log(`Renamed ${d.id} to "Ressources Humaines"`);
            }
            return;
        }

        // Merge logic
        const winner = correctDepts[0];
        console.log(`Target Winner: ${winner.id} (${winner.name})`);

        for (const loser of typoDepts) {
            console.log(`  Merging Typo Dept ${loser.id} (${loser.name}) into Winner...`);
            
            // Update references
            await db.query('UPDATE User SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
            await db.query('UPDATE HiringRequest SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
            try {
                await db.query('UPDATE Candidature SET departmentId = ? WHERE departmentId = ?', [winner.id, loser.id]);
            } catch (e) {}

            await db.query('DELETE FROM Department WHERE id = ?', [loser.id]);
            console.log(`  Deleted Typo Department: ${loser.id}`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        process.exit();
    }
}

fixTypo();
