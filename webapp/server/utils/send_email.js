/**
* @file Helper function to send emails
* @function sendEmail
*/

import nodemailer from "nodemailer";

/** 
* Sends email using gmail as host
* @param {string} email - Receiver's email
* @param {string} subject - Email subject
* @param {string} text - Email content
*/
export async function sendEmail(email, subject, text) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        });

        console.log("Email sent sucessfully");
    } catch (error) {
        console.log(error, "Email not sent");
    }
};

export default sendEmail;