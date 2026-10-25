import axios from 'axios';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL;

const getSmtpTransporter = () => {
  const user = (process.env.SMTP_USER || process.env.MAIL_USER || '').trim();
  const rawPass = (process.env.SMTP_PASS || process.env.MAIL_PASS || '').trim();
  if (!user || !rawPass || user === 'your_mail_user' || rawPass === 'your_mail_password') {
    return null;
  }

  // Remove spaces often present in Google App Passwords (e.g., "abcd efgh ijkl mnop" -> "abcdefghijklmnop")
  const pass = rawPass.replace(/\s+/g, '');
  const rawHost = process.env.SMTP_HOST || process.env.MAIL_HOST;
  const host = rawHost && rawHost !== 'your_mail_server_host' ? rawHost : 'smtp.gmail.com';

  if (host === 'smtp.gmail.com' || user.endsWith('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }

  const port = Number(process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
};

const buildOtpTemplate = (name: string, otp: string) => {
  return {
    subject: 'Your PrintIt verification code',
    text: `Hi ${name},\n\nYour PrintIt verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\n— PrintIt Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f9fafb; padding: 24px; border-radius: 12px;">
          <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 700; color: #111827;">Verify your PrintIt login</h2>
          <p style="margin: 0 0 16px 0; color: #6b7280;">Hi ${name},</p>
          <p style="margin: 0 0 24px 0; color: #6b7280;">Use the following verification code to continue:</p>
          <div style="font-size: 32px; letter-spacing: 8px; font-weight: 700; background: #f3f4f6; display: inline-block; padding: 16px 24px; border-radius: 10px; margin: 16px 0; color: #111827;">
            ${otp}
          </div>
          <p style="margin: 24px 0 0 0; color: #6b7280;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="margin: 12px 0 0 0; color: #6b7280;">If you didn't request this, you can safely ignore this email.</p>
          <p style="margin: 24px 0 0 0; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 24px;">— PrintIt Team</p>
        </div>
      </div>
    `,
  };
};

export const sendOTPEmail = async (email: string, otp: string, name?: string): Promise<boolean> => {
  try {
    const recipientName = name || 'there';
    const template = buildOtpTemplate(recipientName, otp);

    // 1. Prefer SMTP if SMTP_USER/SMTP_PASS or MAIL_USER/MAIL_PASS are configured
    const transporter = getSmtpTransporter();
    if (transporter) {
      const fromName = process.env.MAIL_FROM_NAME || 'PrintIt';
      const fromEmail = process.env.SMTP_USER || process.env.MAIL_USER;
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: email,
        subject: template.subject,
        text: template.text,
        html: template.html,
      });
      console.log(`✅ OTP email sent via SMTP to ${email}`);
      return true;
    }

    // 2. Fallback to external HTTP mail service if EMAIL_SERVICE_URL is configured
    if (EMAIL_SERVICE_URL) {
      const response = await axios.post(EMAIL_SERVICE_URL, {
        recieverEmail: email,
        subject: template.subject,
        body: template.html,
      });

      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ OTP email sent successfully to ${email}`);
        return true;
      }

      console.error('❌ Email service response error:', response.data);
      return false;
    }

    console.error('❌ No email provider configured (set SMTP_USER/SMTP_PASS in .env)');
    return false;
  } catch (error: any) {
    console.error('❌ Failed to send OTP email:', error.message);
    return false;
  }
};

export default {
  sendOTPEmail,
};

export const sendSupportEmail = async (
  toEmail: string,
  subject: string,
  messageHtml: string,
  replyTo?: string
): Promise<boolean> => {
  try {
    const transporter = getSmtpTransporter();
    if (transporter) {
      const fromName = process.env.MAIL_FROM_NAME || 'PrintIt Support';
      const fromEmail = process.env.SMTP_USER || process.env.MAIL_USER;
      await transporter.sendMail({
        from: `"${fromName}" <${fromEmail}>`,
        to: toEmail,
        replyTo,
        subject,
        html: messageHtml,
      });
      console.log(`✅ Support email sent via SMTP to ${toEmail}`);
      return true;
    }

    if (EMAIL_SERVICE_URL) {
      const payload: any = {
        recieverEmail: toEmail,
        subject,
        body: messageHtml,
      };

      if (replyTo) payload.replyTo = replyTo;

      const response = await axios.post(EMAIL_SERVICE_URL, payload);
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Support email sent to ${toEmail}`);
        return true;
      }

      console.error('❌ Email service response error (support):', response.data);
      return false;
    }

    console.error('❌ No email provider configured for support email');
    return false;
  } catch (error: any) {
    console.error('❌ Failed to send support email:', error.message || error);
    return false;
  }
};

