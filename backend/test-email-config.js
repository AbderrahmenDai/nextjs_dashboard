const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendTestEmail() {
    console.log('Attempting to send test email...');
    console.log('User:', process.env.EMAIL_USER);
    // Mask password in logs
    console.log('Pass:', process.env.EMAIL_PASS ? '****' : 'Not Set');

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self for testing
            subject: 'Test Email from HR Dashboard',
            text: 'If you receive this, your email configuration is working correctly!'
        });
        console.log('Email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.code === 'EAUTH') {
            console.log('\nPossible fixes:');
            console.log('1. Check if EMAIL_USER is correct.');
            console.log('2. Check if EMAIL_PASS is a valid App Password (not your Gmail login password).');
            console.log('3. Ensure 2-Factor Authentication is enabled on your Google Account to use App Passwords.');
        }
    }
}

sendTestEmail();
