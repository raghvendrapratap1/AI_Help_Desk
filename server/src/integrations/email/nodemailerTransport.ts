import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
export const DEFAULT_EMAIL_FROM = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Indore Poly Dental Clinic" <raghvendrapratapsingh505@gmail.com>';

const isSmtpConfigured = Boolean(
  SMTP_HOST &&
  SMTP_HOST !== 'smtp.example.com' &&
  SMTP_USER &&
  SMTP_PASSWORD &&
  SMTP_PASSWORD !== 'your_smtp_app_password_here'
);

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

let realTransporter: any = null;

if (isSmtpConfigured) {
  realTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD
    },
    connectionTimeout: 4000,
    greetingTimeout: 4000,
    socketTimeout: 5000
  });
  console.log(`[EMAIL] SMTP transport configured for ${SMTP_HOST}:${SMTP_PORT}`);
} else {

  console.log(`[EMAIL] Live SMTP credentials not provided. Using safe structured console email logger.`);
}

/**
 * Send email via real SMTP if configured, or cleanly log payload if mock mode.
 * Guaranteed never to throw uncaught error to callers.
 */
export const dispatchEmail = async (options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const from = options.from || DEFAULT_EMAIL_FROM;
  
  if (realTransporter) {
    try {
      const info = await realTransporter.sendMail({
        from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>?/gm, '')
      });
      console.log(`[EMAIL SENT] Subject: "${options.subject}" To: ${options.to} (MessageID: ${info.messageId})`);
      return { success: true, messageId: info.messageId };
    } catch (err: any) {
      console.error(`[EMAIL ERROR] Failed to dispatch via SMTP: ${err.message}`);
      return { success: false, error: err.message };
    }
  } else {
    // Graceful free-tier mock mode
    console.log(`\n================== [OUTGOING EMAIL DISPATCH] ==================`);
    console.log(`From:    ${from}`);
    console.log(`To:      ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text || options.html.replace(/<[^>]*>?/gm, '').trim()}`);
    console.log(`===============================================================\n`);
    return { success: true, messageId: `mock_${Date.now()}` };
  }
};
