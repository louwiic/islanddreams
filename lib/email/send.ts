import { transporter, FROM } from './transporter';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({ to, subject, html, replyTo }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
    });
    return { ok: true };
  } catch (error) {
    console.error('[EMAIL] Erreur envoi:', error);
    return { ok: false, error };
  }
}
