const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT) || 587;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

async function sendReportEmail({ to, name, filename, pdf }) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Email is not configured on the server');
  }
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: 'Your CareerPath career report',
    text: `Hi ${name},\n\nYour CareerPath report is attached.\n\nCareerPath provides decision support only and is not a substitute for professional counseling.`,
    attachments: [{ filename, content: pdf, contentType: 'application/pdf' }],
  });
}

module.exports = { sendReportEmail };