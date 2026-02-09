const http = require('http');
const db = require('../config/db');

async function createDummyRequest() {
    try {
        console.log('🚀 Starting Dummy Request Creation...');

        // 1. Find a suitable Requester (Not Responsable RH to trigger standard flow)
        const [requesters] = await db.query(`
            SELECT User.id, User.name, Role.name as roleName 
            FROM User 
            JOIN Role ON User.roleId = Role.id 
            WHERE Role.name NOT LIKE 'Responsable RH%' 
            LIMIT 1
        `);

        if (requesters.length === 0) {
            console.error('❌ No suitable requester found.');
            process.exit(1);
        }

        const requester = requesters[0];
        console.log(`👤 Using Requester: ${requester.name} (${requester.roleName})`);

        // 2. Find a valid Department and Role
        const [departments] = await db.query('SELECT id FROM Department LIMIT 1');
        const [roles] = await db.query('SELECT id FROM Role LIMIT 1');
        
        const departmentId = departments.length > 0 ? departments[0].id : null;
        const roleId = roles.length > 0 ? roles[0].id : null;
        
        if (!departmentId) {
            console.warn('⚠️ No departments found, using dummy ID (might fail FK)');
        }

        // 3. Prepare Request Data
        const postData = JSON.stringify({
            requesterId: requester.id,
            title: `🔥 URGENT: Ingénieur Test - ${new Date().toLocaleTimeString()}`,
            departmentId: departmentId || 'dept-123', 
            roleId: roleId || null,
            site: 'Tunis',
            contractType: 'CDI',
            // Status is handled by controller but let's be explicit for clarity
            status: 'Pending Responsable RH', 
            priority: 'High',
            reason: 'Renforcement équipe QA',
            description: 'Test automatique du flux de validation'
        });

        // 3. Send POST Request
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: '/api/hiring-requests',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('📡 Sending Request to API...');
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => { data += chunk; });
            
            res.on('end', async () => {
                if (res.statusCode === 201) {
                    const response = JSON.parse(data);
                    console.log(`✅ Request Created Successfully! ID: ${response.id}`);
                    
                    // 4. Verify Notification for Responsable RH
                    console.log('🔍 Verifying Notification for Responsable RH...');
                    await checkNotification(response.id);
                } else {
                    console.error(`❌ API Error: ${res.statusCode}`);
                    console.error(data);
                }
                process.exit(0);
            });
        });

        req.on('error', (e) => {
            console.error(`❌ Request Failed: ${e.message}`);
            process.exit(1);
        });

        req.write(postData);
        req.end();

    } catch (e) {
        console.error('❌ Script Error:', e);
        process.exit(1);
    }
}

async function checkNotification(entityId) {
    // Find Responsable RH ID
    const [rhUsers] = await db.query(`
        SELECT User.id, User.name FROM User 
        JOIN Role ON User.roleId = Role.id 
        WHERE Role.name LIKE 'Responsable RH%'
    `);

    if (rhUsers.length === 0) {
        console.log('⚠️ No Responsable RH found in DB to check notifications for.');
        return;
    }

    const rhId = rhUsers[0].id;
    console.log(`Checking notifications for ${rhUsers[0].name} (ID: ${rhId})...`);

    // Check DB for notification
    const [notifs] = await db.query(`
        SELECT * FROM Notification 
        WHERE receiverId = ? AND entityId = ?
    `, [rhId, entityId]);

    if (notifs.length > 0) {
        console.log('✅ SUCCESS: Notification found in database!');
        console.log(`   - Message: "${notifs[0].message}"`);
        console.log(`   - Type: ${notifs[0].type}`);
    } else {
        console.error('❌ FAILURE: No notification found for this request.');
    }
}

createDummyRequest();
