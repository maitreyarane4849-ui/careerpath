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

async function sendViaBrevo({ to, name, filename, pdf }) {
  if (!process.env.MAIL_FROM_EMAIL) {
    throw new Error('MAIL_FROM_EMAIL is not set on the server');
  }
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: { name: process.env.MAIL_FROM_NAME || 'CareerPath', email: process.env.MAIL_FROM_EMAIL },
      to: [{ email: to }],
      subject: 'Your CareerPath career report',
      textContent: `Hi ${name},\n\nYour CareerPath report is attached.\n\nCareerPath provides decision support only and is not a substitute for professional counseling.`,
      attachment: [{ name: filename, content: pdf.toString('base64') }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Brevo error ${res.status}: ${await res.text()}`);
}

async function sendViaSmtp({ to, name, filename, pdf }) {
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

async function sendReportEmail(args) {
  if (process.env.BREVO_API_KEY) return sendViaBrevo(args);
  return sendViaSmtp(args);
}

module.exports = { sendReportEmail };