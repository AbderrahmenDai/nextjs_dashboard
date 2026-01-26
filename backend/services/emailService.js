const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : ''
    }
});

const sendWelcomeEmail = async (to, name, email, password) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="background-color: #4F46E5; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to HR Dashboard</h1>
        </div>
        <div style="padding: 20px; background-color: white;">
            <p style="font-size: 16px; color: #333;">Hello <strong>${name}</strong>,</p>
            <p style="font-size: 16px; color: #333;">Welcome to the team! Your account has been successfully created.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #555;"><strong>Password:</strong> ${password}</p>
            </div>
            <p style="font-size: 16px; color: #333;">Please login and change your password as soon as possible.</p>
            <div style="text-align: center; margin-top: 30px;">
                <a href="http://localhost:3001/auth/sign-in" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 16px; color: #333; margin: 0;">Best regards,</p>
                <p style="font-size: 18px; font-weight: bold; color: #4F46E5; margin: 5px 0;">Hiba Saadani</p>
                <p style="font-size: 14px; color: #777; margin: 0;">HR Tesca</p>
            </div>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} HR Dashboard. All rights reserved.
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Welcome to HR Dashboard - Your Login Credentials',
            html
        });
        console.log(`Welcome email sent to ${to}`);
    } catch (error) {
        console.error('Error sending welcome email:', error);
    }
};

const sendInterviewEmail = async (to, candidateName, date, mode, type, notes) => {
    const formattedDate = new Date(date).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="background-color: #10B981; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">Interview Invitation</h1>
        </div>
        <div style="padding: 20px; background-color: white;">
            <p style="font-size: 16px; color: #333;">Dear <strong>${candidateName}</strong>,</p>
            <p style="font-size: 16px; color: #333;">We are pleased to invite you for an interview for the position you applied for.</p>
            
            <div style="background-color: #f0fdf4; border-left: 5px solid #10B981; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #047857;">Interview Details</h3>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Mode:</strong> ${mode}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Type:</strong> ${type}</p>
                ${notes ? `<p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>

            <p style="font-size: 16px; color: #333;">Please ensure you are available at the scheduled time. If you have any questions or need to reschedule, please reply to this email.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Confirm Attendance</a>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 16px; color: #333; margin: 0;">Best regards,</p>
                <p style="font-size: 18px; font-weight: bold; color: #10B981; margin: 5px 0;">Hiba Saadani</p>
                <p style="font-size: 14px; color: #777; margin: 0;">HR Tesca</p>
            </div>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
            &copy; ${new Date().getFullYear()} HR Dashboard. All rights reserved.
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: 'Interview Invitation - HR Dashboard',
            html
        });
        console.log(`Interview email sent to ${to}`);
    } catch (error) {
        console.error('Error sending interview email:', error);
    }
};

const sendInterviewerEmail = async (to, interviewerName, candidateName, date, mode, type, notes) => {
    const formattedDate = new Date(date).toLocaleString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
        <div style="background-color: #3B82F6; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">New Interview Scheduled</h1>
        </div>
        <div style="padding: 20px; background-color: white;">
            <p style="font-size: 16px; color: #333;">Hello <strong>${interviewerName}</strong>,</p>
            <p style="font-size: 16px; color: #333;">You have been assigned to conduct an interview with <strong>${candidateName}</strong>.</p>
            
            <div style="background-color: #eff6ff; border-left: 5px solid #3B82F6; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">Interview Details</h3>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Candidate:</strong> ${candidateName}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Mode:</strong> ${mode}</p>
                <p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Type:</strong> ${type}</p>
                ${notes ? `<p style="margin: 5px 0; font-size: 14px; color: #333;"><strong>Notes:</strong> ${notes}</p>` : ''}
            </div>

            <p style="font-size: 16px; color: #333;">Please ensure you are prepared for the session.</p>
            
            <div style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                <p style="font-size: 16px; color: #333; margin: 0;">Best regards,</p>
                <p style="font-size: 18px; font-weight: bold; color: #4F46E5; margin: 5px 0;">Hiba Saadani</p>
                <p style="font-size: 14px; color: #777; margin: 0;">HR Tesca</p>
            </div>
            <div style="text-align: center; padding: 20px; font-size: 12px; color: #888;">
                &copy; ${new Date().getFullYear()} HR Dashboard. All rights reserved.
            </div>
        </div>
    </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject: `New Interview Scheduled: ${candidateName}`,
            html
        });
        console.log(`Interviewer email sent to ${to}`);
    } catch (error) {
        console.error('Error sending interviewer email:', error);
    }
};

module.exports = {
    sendWelcomeEmail,
    sendInterviewEmail,
    sendInterviewerEmail
};
