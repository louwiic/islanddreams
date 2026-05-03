import nodemailer from 'nodemailer';

const port = Number(process.env.SMTP_PORT) || 465;

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const FROM = process.env.SMTP_FROM || 'Island Dreams <contact@islanddreams.re>';
