const db = require('../backend/models');
const userService = require('../backend/services/userService');
const hiringRequestService = require('../backend/services/hiringRequestService');
const { v4: uuidv4 } = require('uuid');

async function test() {
    try {
        console.log('Starting Test Flow...');

        // 1. Create Department
        console.log('1. Creating Department...');
        const dept = await db.Department.create({
            name: 'HR Department',
            site: 'TT', // Enum
            head: 'Test Head',
            location: 'Building A'
        });
        console.log('   Department created:', dept.id);

        // 2. Create User (DRH)
        console.log('2. Creating User (DRH)...');
        const userData = {
            name: 'John Doe',
            email: 'john.doe@test.com',
            password: 'password123',
            role: 'drh', // Enum
            departmentId: dept.id,
            status: 'Active'
        };
        const user = await userService.createUser(userData);
        console.log('   User created:', user.id, user.role);

        // 3. Login
        console.log('3. Logging in...');
        const loggedInUser = await userService.loginUser('john.doe@test.com', 'password123');
        console.log('   Login successful. Token:', loggedInUser.token ? 'Yes' : 'No');

        // 4. Create Hiring Request
        console.log('4. Creating Hiring Request...');
        const requestData = {
            title: 'Need new Recruiter',
            departmentId: dept.id,
            site: 'TT',
            requesterId: user.id,
            reason: 'Expansion',
            contractType: 'CDI',
            budget: 50000,
            numberOfPositions: 1
        };
        
        // We simulate the controller logic partially by calling service directly, 
        // but controller has the extra logic for notifications.
        // For this test, I want to verify the SERVICE layer mostly, 
        // and database constraints.
        
        const hr = await hiringRequestService.createHiringRequest({
            ...requestData,
            status: 'Pending HR Director'
        });
        console.log('   Hiring Request created:', hr.id, hr.status);

        // 5. Verify Association
        const fetchedHr = await hiringRequestService.getHiringRequestById(hr.id);
        console.log('   Fetched Request Requester Name:', fetchedHr.requesterName);

        if (fetchedHr.requesterName === 'John Doe') {
            console.log('SUCCESS: Flow verification passed.');
        } else {
            console.error('FAILURE: Requester name mismatch.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Test Failed:', error);
        process.exit(1);
    }
}

test();
