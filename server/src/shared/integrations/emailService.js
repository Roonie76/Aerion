import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

let transporter;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const mailer = getTransporter();

  if (!mailer) {
    logger.info('Email delivery skipped because SMTP is not configured', { to, subject });
    return { delivered: false, reason: 'SMTP_NOT_CONFIGURED' };
  }

  await mailer.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    html,
    text,
  });

  return { delivered: true };
}
