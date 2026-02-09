const db = require('../config/db');
const hiringRequestService = require('../services/hiringRequestService');
// Need to mock express request/response or use axios/fetch against running server?
// Or just call the service directly?
// The 404 error is likely from the Controller logic checking the user existence.

// Let's test the Controller logic by simulating a request if we can, or just check the DB.
// Actually, let's use `axios` to hit the running server if possible. Or native fetch (node 18+).

async function testCreateRequest() {
    try {
        console.log("Fetching a valid user ID...");
        const [users] = await db.query('SELECT id, name FROM User LIMIT 1');
        if (users.length === 0) {
            console.error("No users found! Cannot test.");
            process.exit(1);
        }
        const user = users[0];
        console.log(`Using User: ${user.name} (${user.id})`);

        // Now attempt to POST to the local API
        const port = process.env.PORT || 8080; // .env said 8080 previously
        const url = `http://localhost:${port}/api/hiring-requests`;
        
        console.log(`POSTing to ${url}...`);
        
        const payload = {
            title: "Test Request from Script",
            departmentId: "some-dept-id", // Need a valid one? Service doesn't check existence strictly? 
            // Actually service inserts DeptId. If Foreign Key constraint exists, we need valid ID.
            requesterId: user.id,
            category: "Cadre",
            status: "Pending HR",
            site: "TT"
        };
        
        // Get a valid department first
        const [depts] = await db.query('SELECT id FROM Department LIMIT 1');
        if (depts.length > 0) payload.departmentId = depts[0].id;

        // Use fetch
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("✅ Success! Created Request ID:", data.id);
        } else {
            console.error(`❌ Failed: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error("Response:", text);
        }

        process.exit(0);

    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

testCreateRequest();
