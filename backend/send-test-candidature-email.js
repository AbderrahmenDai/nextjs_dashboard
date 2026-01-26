const emailService = require('./services/emailService');

async function sendTest() {
    console.log('Sending interview email to: abderrahmen.dai.11@gmail.com');
    await emailService.sendInterviewEmail(
        'abderrahmen.dai.11@gmail.com',  // target email from your prompt
        'Abderrahmen Test Candidate',     // candidate name
        new Date().toISOString(),         // date
        'Remote',                        // mode
        'Technical',                     // type
        'This is a manual test triggered by the agent.' // notes
    );
    console.log('✅ Done calling email service.');
}

sendTest();
