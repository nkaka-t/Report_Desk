const nodemailer = require('nodemailer');
const { Notification } = require('../models');

// Simple in-app notification creator and email stub
const createNotification = async ({ user_id, type, payload, sendEmail = false }) => {
  try {
    const n = await Notification.create({ user_id, type, payload });
    if (sendEmail) {
      // NOTE: This is a stub - configure SMTP in env for real emails
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT,10) : 1025,
        secure: false,
        auth: null, // MailHog doesn't require auth
      });
      await transporter.sendMail({
        from: process.env.SMTP_FROM || 'no-reply@reportdesk.local',
        to: payload && payload.toEmail ? payload.toEmail : 'noreply@example.com',
        subject: `ReportDesk: ${type}`,
        text: JSON.stringify(payload || {})
      });
    }
    return n;
  } catch (err) {
    console.error('notify error', err);
    return null;
  }
};

module.exports = { createNotification };
