//server/configs/mail.config.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Verify on startup
if (!process.env.RESEND_API_KEY) {
  console.error("[Mail Config] ❌ RESEND_API_KEY is missing from environment variables");
} else {
  console.log("[Mail Config] ✅ Resend mail client initialized");
}

export default resend;