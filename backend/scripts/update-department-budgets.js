
const db = require('../config/db');

const DEPT_BUDGETS = {
    "Ressources Humaines": 150000,
    "HSE": 120000,
    "Achat": 3000000, // Purchasing often handles large sums, but operational budget might be smaller. Let's give them a good amount.
    "Finance": 180000,
    "Qualité": 130000,
    "Indus & Amélioration Continue": 250000,
    "Production": 800000,
    "Supply Chain": 300000,
    "Direction": 500000
};

async function updateBudgets() {
    try {
        console.log("💰 Updating Department Budgets...");

        const [departments] = await db.query('SELECT * FROM Department');
        
        for (const dept of departments) {
            let budget = 0;
            const normName = dept.name.trim();

            // Match known departments
            if (DEPT_BUDGETS[normName]) {
                budget = DEPT_BUDGETS[normName];
            } else {
                // Default random for others
                budget = Math.floor(Math.random() * 400000) + 100000;
            }

            // Apply update
            await db.query('UPDATE Department SET budget = ? WHERE id = ?', [budget, dept.id]);
            console.log(`Updated ${normName} (${dept.siteId}) -> Budget: ${budget.toLocaleString()}`);
        }

        console.log("✅ Budgets updated successfully.");

    } catch (error) {
        console.error("❌ Error updating budgets:", error);
    } finally {
        process.exit();
    }
}

updateBudgets();
