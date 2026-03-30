import nodemailer from 'nodemailer';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const sendContactEmail = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    const err = new Error('All fields are required.');
    err.statusCode = 400;
    throw err;
  }

  // Configure transporter
  // IMPORTANT: For Gmail, user must use an "App Password"
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'aerionsports@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"${name}" <${email}>`,
    to: process.env.EMAIL_USER || 'aerionsports@gmail.com',
    subject: `[Contact Form] ${subject} - from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
        <h2 style="color: #c9a84c;">New Inquiry from Aerion Contact Form</h2>
        <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="border: none; border-top: 1px solid #eee;" />
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    const err = new Error('Failed to send email. Please check server configuration.');
    err.statusCode = 500;
    throw err;
  }
});
