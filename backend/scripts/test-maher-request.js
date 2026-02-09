const db = require('../config/db');
const hiringRequestService = require('../services/hiringRequestService');
const { v4: uuidv4 } = require('uuid');

async function testMaher() {
    try {
        // 1. Find Maher
        const [users] = await db.query("SELECT * FROM User WHERE name LIKE '%Maher%' LIMIT 1");
        if (users.length === 0) {
            console.error("Maher not found!");
            process.exit(1);
        }
        const maher = users[0];
        console.log(`Using Maher: ${maher.name} (${maher.id}) with RoleId: ${maher.roleId}`);

        // 2. Simulate Create Request
        const requestData = {
            title: "Test Request from Maher Script",
            departmentId: maher.departmentId || "some-valid-dept-id", // Ensure this dept exists
            requesterId: maher.id,
            category: "Cadre",
            status: "Pending HR",
            description: "Testing creation logic",
            site: "TT"
        };
        
        // If deptId is null, fetch one
        if (!requestData.departmentId) {
             const [depts] = await db.query("SELECT id FROM Department LIMIT 1");
             requestData.departmentId = depts[0].id;
        }

        console.log("Creating request:", requestData);
        
        // Call Service directly (skip controller logic initially to isolate Service/DB issue)
        try {
            const newItem = await hiringRequestService.createHiringRequest(requestData);
            console.log("✅ Service createHiringRequest SUCCESS:", newItem.id);
        } catch (svcErr) {
            console.error("❌ Service createHiringRequest FAILED:", svcErr);
        }

        // Now test Controller logic (mocked)
        // We can't easily mock controller here without express, but we can inspect the logic.
        // The controller adds 'targetApprovers' and sends notifications.
        
        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

testMaher();
