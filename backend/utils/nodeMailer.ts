import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});


export const sendPasswordResetEmail = async(toEmail:string, resetLink:string) => {
    const mailOptions = {
        from: `Your App Security <${process.env.EMAIL_USER}>`,
        to:toEmail,
        subject: "Password Reset Request",
       text: `Hello! Please click the following link to reset your password: ${resetLink}. This link will expire shortly.`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. Click the button below to change it:</p>
        <a href="${resetLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
        <p style="margin-top: 20px; font-size: 12px; color: #777;">If you did not request this, please ignore this email.</p>
      </div>
    `,
    }

    await transporter.sendMail(mailOptions);
}
            