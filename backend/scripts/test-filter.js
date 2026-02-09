const db = require('../config/db');
const hiringRequestService = require('../services/hiringRequestService');

// Mock data
const DEMANDEUR_ROLE_ID = 'd8d2f46b-af3f-4c84-aaa6-8aeb6378104f';
const MAHER_EMAIL = 'maher.farhani@tescagroup.com';

async function testFiltering() {
    try {
        console.log("🔍 Testing requesterId filtering...");

        // 1. Get Maher's ID
        const [users] = await db.query('SELECT id, name FROM User WHERE email = ?', [MAHER_EMAIL]);
        if (users.length === 0) {
            console.error("❌ Maher not found!");
            process.exit(1);
        }
        const maher = users[0];
        console.log(`👤 User: ${maher.name} (${maher.id})`);

        // 2. Fetch Requests WITHOUT filter
        const allRequests = await hiringRequestService.getAllHiringRequests(1, 100); // 100 limit to see all
        console.log(`📋 Total Requests in System: ${allRequests.data.length}`);

        // 3. Fetch Requests WITH filter
        const filteredRequests = await hiringRequestService.getAllHiringRequests(1, 10, maher.id);
        console.log(`🎯 Requests for Maher: ${filteredRequests.data.length}`);

        // 4. Verify
        const foreignRequests = filteredRequests.data.filter(r => r.requesterId !== maher.id);
        if (foreignRequests.length > 0) {
            console.error("❌ Filter FAILED! Found requests from other users:", foreignRequests.map(r => r.requesterName));
        } else {
            console.log("✅ Filter PASSED! All returned requests belong to Maher.");
            if (filteredRequests.data.length > 0) {
                console.log("Sample:", filteredRequests.data[0].title);
            }
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

testFiltering();
