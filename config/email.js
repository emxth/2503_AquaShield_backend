// backend/config/email.js
import nodemailer from "nodemailer";

// Create reusable transporter
const createTransporter = () => {
  // For development, you can use services like Gmail (app password), Mailtrap (testing), SendGrid (production)
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASSWORD, // Your email password or app password
    },
  });
};

// Send email function
export const sendEmail = async ({ email, subject, html, text }) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME || "Fisheries App"} <${
      process.env.EMAIL_FROM || process.env.EMAIL_USER
    }>`,
    to: email,
    subject,
    html,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Email templates
export const emailTemplates = {
  resetPassword: (resetUrl, name) => ({
    subject: "Password Reset Request",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #00A5E3; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .button { display: inline-block; background-color: #00A5E3; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>🔐 Password Reset Request</h1></div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>You have requested to reset your password. Click the button below to reset it:</p>
            <center><a href="${resetUrl}" class="button">Reset Password</a></center>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #00A5E3;">${resetUrl}</p>
            <div class="warning"><strong>⚠️ Important:</strong> This link will expire in 10 minutes.</div>
            <p>If you didn't request a password reset, please ignore this email.</p>
            <p>Best regards,<br>Fisheries Management Team</p>
          </div>
          <div class="footer"><p>This is an automated email. Please do not reply.</p></div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${name},\n\nYou have requested to reset your password.\n\n${resetUrl}\n\nThis link will expire in 10 minutes.\n\nIf you didn't request a password reset, please ignore this email.\n\nBest regards,\nFisheries Management Team`,
  }),

  passwordResetSuccess: (name) => ({
    subject: "Password Reset Successful",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10B981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h1>✅ Password Reset Successful</h1></div>
          <div class="content">
            <div class="success-icon">✓</div>
            <p>Hello ${name},</p>
            <p>Your password has been successfully reset.</p>
            <p>You can now log in with your new password.</p>
            <p>If you didn't make this change, please contact support immediately.</p>
            <p>Best regards,<br>Fisheries Management Team</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Hello ${name},\n\nYour password has been successfully reset.\n\nYou can now log in with your new password.\n\nIf you didn't make this change, please contact support immediately.\n\nBest regards,\nFisheries Management Team`,
  }),
};

// Default export (optional)
export default { sendEmail, emailTemplates };
