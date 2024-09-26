import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
dotenv.config();

export const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};
export const calculateAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    const dayDifference = today.getDate() - dob.getDate();
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    return age;
}



const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    secure: false,
    debug: true,
    logger: true
});

export const sendWelcomeEmail = async (userEmail, userName) => {
    const mailOptions = {
        from: {
            name: "Scholarly",
            address: process.env.EMAIL_USER
        },
        to: userEmail,
        subject: 'Welcome to Our Scholarly!🤌',
        text: `Hello ${userName}!,\n\nThank you for signing up to our School Management System. We are excited to have you onboard!\n\nBest regards,\nSchool Management Team`
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully.');
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
};
export const generateImageUrl = (file) => {
    const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';

    // Convert backslashes to forward slashes and ensure there are no leading slashes
    const imageUrl = `${serverUrl}/${file.replace(/\\/g, '/').replace(/^\/+/, '')}`;

    return imageUrl;
};
