const transporter = require("../config/emailConfig");

const sendEmail = async (to, subject, html, attachments) => {
    const mailOptions = {
        from: process.env.EMAIL,
        to,
        subject,
        html,
        attachments,
    };
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
