const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS.replace(/\s+/g, '')
    }
});

async function sendTest() {
    console.log('Attempting to send email with:', process.env.EMAIL_USER);
    console.log('Using password starting with:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) + '****' : 'UNDEFINED');
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Debug Script',
            text: 'If you receive this, the credentials are correct.'
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
}

sendTest();
