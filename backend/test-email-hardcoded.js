const nodemailer = require('nodemailer');

const user = 'abderrahmen.dai.11@gmail.com';
const pass = 'yocr redb kmmm xmbc'.replace(/\s+/g, '');

console.log('User:', user);
console.log('Pass:', pass);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: user,
        pass: pass
    }
});

async function sendTest() {
    try {
        const info = await transporter.sendMail({
            from: user,
            to: user,
            subject: 'Hardcoded Creds Test',
            text: 'It works!'
        });
        console.log('✅ Email sent:', info.messageId);
    } catch (error) {
        console.error('❌ Failed:', error);
    }
}

sendTest();
