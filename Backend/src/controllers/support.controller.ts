import { Request, Response } from 'express';
import * as emailService from '../services/email.service';

// Use ADMIN_EMAIL or SUPPORT_EMAIL_TO if configured
const SUPPORT_RECIPIENT = process.env.SUPPORT_EMAIL_TO || process.env.ADMIN_EMAIL;

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  const { email, subject, message } = req.body;

  if (!email || !subject || !message) {
    res.status(400).json({ message: 'Email, subject, and message are required.' });
    return;
  }

  try {
    console.log('Contact form submission:', { email, subject, message });

    if (!SUPPORT_RECIPIENT) {
      console.warn('Support recipient not configured; contact logged but email not sent. Set SUPPORT_EMAIL_TO or ADMIN_EMAIL.');
      res.json({ message: 'Contact request received (logged). Support email not configured.' });
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #111827;">
        <h3>New contact request</h3>
        <p><strong>From:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="border-top:1px solid #e5e7eb;padding-top:8px">${message.replace(/\n/g, '<br/>')}</div>
      </div>
    `;

    const sent = await emailService.sendSupportEmail(SUPPORT_RECIPIENT, `Contact: ${subject}`, html, email);

    if (sent) {
      res.json({ message: 'Contact request received. Support team has been notified.' });
    } else {
      res.status(502).json({ message: 'Contact received but failed to notify support.' });
    }
  } catch (error: any) {
    console.error('Contact form submission failed:', error.message || error);
    res.status(500).json({ message: 'Failed to send contact request. Please try again later.' });
  }
};
