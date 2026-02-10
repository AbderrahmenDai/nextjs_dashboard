
const db = require('../config/db');
const fs = require('fs');

async function checkStrictDuplicates() {
    let output = "";
    try {
        console.log("Fetching all departments...");
        const [departments] = await db.query('SELECT * FROM Department');
        
        const keyMap = {};
        departments.forEach(d => {
            const key = `${d.name.trim().toLowerCase()}|${d.siteId}`;
            if (!keyMap[key]) {
                keyMap[key] = [];
            }
            keyMap[key].push(d);
        });

        const duplicates = Object.keys(keyMap).filter(key => keyMap[key].length > 1);

        if (duplicates.length === 0) {
            output += "No strict duplicates (Same Name + Same Site) found.\n";
            output += "Scanning for cross-site duplicates (Same Name, Different Site)...\n";
            
            // Check cross-site duplicates
            const nameMap = {};
            departments.forEach(d => {
                const name = d.name.trim().toLowerCase();
                if (!nameMap[name]) nameMap[name] = [];
                nameMap[name].push(d);
            });
            const nameDuplicates = Object.keys(nameMap).filter(k => nameMap[k].length > 1);
            output += `Found ${nameDuplicates.length} names used in multiple sites.\n`;
             for (const key of nameDuplicates) {
                output += `\nName: "${key}"\n`;
                for (const d of nameMap[key]) {
                     output += ` - ID: ${d.id}, SiteID: ${d.siteId}\n`;
                }
            }

        } else {
            output += `Found ${duplicates.length} sets of STRICT duplicates (Same Name + Same Site):\n`;
            for (const key of duplicates) {
                const [name, siteId] = key.split('|');
                output += `\nName: "${name}", Site: ${siteId}\n`;
                const dups = keyMap[key];
                for (const d of dups) {
                    const [userCount] = await db.query('SELECT COUNT(*) as count FROM User WHERE departmentId = ?', [d.id]);
                    const [hrCount] = await db.query('SELECT COUNT(*) as count FROM HiringRequest WHERE departmentId = ?', [d.id]);
                    output += ` - ID: ${d.id}, Users: ${userCount[0].count}, HiringRequests: ${hrCount[0].count}\n`;
                }
            }
        }

        fs.writeFileSync('backend/strict-duplicate-report.txt', output);
        console.log("Report written to backend/strict-duplicate-report.txt");

    } catch (error) {
        console.error("Error checking duplicates:", error);
    } finally {
        process.exit();
    }
}

checkStrictDuplicates();
