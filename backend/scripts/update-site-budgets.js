
const db = require('../config/db');

async function updateSiteBudgets() {
    try {
        console.log("📊 Updating Site Budgets based on Department Allocations...");

        // 1. Get all departments
        const [departments] = await db.query('SELECT siteId, budget FROM Department');
        
        // 2. Sum budgets per site
        const siteBudgets = {};
        for (const dept of departments) {
            const siteId = dept.siteId;
            if (!siteBudgets[siteId]) siteBudgets[siteId] = 0;
            siteBudgets[siteId] += (dept.budget || 0);
        }

        console.log("Calculated Site Budgets:", siteBudgets);

        // 3. Update Sites
        for (const [siteId, total] of Object.entries(siteBudgets)) {
            // Find site first
            const [sites] = await db.query('SELECT * FROM Site WHERE id = ?', [siteId]);
            if (sites.length === 0) {
                 console.log(`Warning: Site '${siteId}' used in departments but not found in Site table. Creating it...`);
                 await db.query('INSERT INTO Site (id, name, budget, description) VALUES (?, ?, ?, ?)', 
                    [siteId, siteId, total, `Site ${siteId}`]);
            } else {
                 await db.query('UPDATE Site SET budget = ? WHERE id = ?', [total, siteId]);
            }
            console.log(`Updated Site '${siteId}' -> Budget: ${total.toLocaleString()}`);
        }

        console.log("✅ Site Budgets Updated.");

    } catch (error) {
        console.error("❌ Error updating site budgets:", error);
    } finally {
        process.exit();
    }
}

updateSiteBudgets();
