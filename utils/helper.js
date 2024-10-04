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
export const classesList = [
    { value: "I A", label: "I A" },
    { value: "I B", label: "I B" },
    { value: "I C", label: "I C" },
    { value: "II A", label: "II A" },
    { value: "II B", label: "II B" },
    { value: "II C", label: "II C" },
    { value: "III A", label: "III A" },
    { value: "III B", label: "III B" },
    { value: "III C", label: "III C" },
    { value: "IV A", label: "IV A" },
    { value: "IV B", label: "IV B" },
    { value: "IV C", label: "IV C" },
    { value: "V A", label: "V A" },
    { value: "V B", label: "V B" },
    { value: "V C", label: "V C" },
    { value: "VI A", label: "VI A" },
    { value: "VI B", label: "VI B" },
    { value: "VI C", label: "VI C" },
    { value: "VII A", label: "VII A" },
    { value: "VII B", label: "VII B" },
    { value: "VII C", label: "VII C" },
    { value: "VIII A", label: "VIII A" },
    { value: "VIII B", label: "VIII B" },
    { value: "VIII C", label: "VIII C" },
    { value: "IX A", label: "IX A" },
    { value: "IX B", label: "IX B" },
    { value: "IX C", label: "IX C" },
    { value: "X A", label: "X A" },
    { value: "X B", label: "X B" },
    { value: "X C", label: "X C" },
];
export const parseQueryArray = (queryParam) => {
    if (!queryParam) {
        return []; // Return an empty array if no query parameter is provided
    }

    // If it's already an array, return as is
    if (Array.isArray(queryParam)) {
        return queryParam;
    }

    // Remove square brackets if they exist and split the string by commas
    return queryParam.replace(/[\[\]]/g, '').split(',').map(item => item.trim());
};