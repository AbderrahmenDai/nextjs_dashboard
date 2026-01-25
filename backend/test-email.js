const emailService = require('./services/emailService');

console.log('Sending test emails...');

async function test() {
    try {
        await emailService.sendWelcomeEmail(
            'mohamedmouheb@gmail.com', 
            'Test User', 
            'mohamedmouheb@gmail.com', 
            'testpassword123'
        );
        console.log('Welcome email test completed.');

        await emailService.sendInterviewEmail(
            'mohamedmouheb@gmail.com',
            'Test Candidate',
            new Date().toISOString(),
            'Video Call',
            'Technical',
            'Please prepare for a coding test.'
        );
        console.log('Interview email test completed.');

        await emailService.sendInterviewerEmail(
            'mohamedmouheb@gmail.com',
            'Test Interviewer',
            'Test Candidate',
            new Date().toISOString(),
            'Video Call',
            'Technical',
            'Prepare the technical questions.'
        );
        console.log('Interviewer email test completed.');
    } catch (e) {
        console.error('Test failed:', e);
    }
}

test();
