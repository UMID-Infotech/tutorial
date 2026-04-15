//server/configs/mail.config.js
import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465, // Use 465 (SSL) instead of 587 (TLS) — Render free tier blocks 587
  secure: true, // true for port 465
  family: 4, // Force IPv4 — Render free tier blocks IPv6 SMTP
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Avoid TLS certificate issues on Render
  },
});

// Verify transporter config on server start
transporter.verify((error, success) => {
  if (error) {
    console.error(
      "[Mail Config] ❌ Transporter verification failed:",
      error.message,
    );
  } else {
    console.log("[Mail Config] ✅ Mail transporter is ready to send emails");
  }
});

export default transporter;
