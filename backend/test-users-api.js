// Test script to verify users API endpoint
const fetch = require('node-fetch');

async function testUsersEndpoint() {
    try {
        console.log('🔍 Testing Users API Endpoint...\n');
        
        const response = await fetch('http://localhost:8080/api/users');
        
        if (!response.ok) {
            console.error(`❌ API returned status: ${response.status}`);
            return;
        }
        
        const users = await response.json();
        
        console.log(`✅ Successfully fetched ${users.length} users\n`);
        
        if (users.length > 0) {
            console.log('📋 First user structure:');
            console.log(JSON.stringify(users[0], null, 2));
            
            console.log('\n📊 All users summary:');
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} (${user.email})`);
                console.log(`   Role: ${user.role} | Department: ${user.department} | Site: ${user.site}`);
                console.log(`   Status: ${user.status}`);
                console.log('');
            });
        } else {
            console.log('⚠️  No users found in database');
        }
        
    } catch (error) {
        console.error('❌ Error testing users endpoint:', error.message);
    }
}

testUsersEndpoint();
