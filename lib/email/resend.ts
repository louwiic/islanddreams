import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM || 'Island Dreams <contact@islanddreams.re>';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendResendEmail({ to, subject, html, replyTo }: EmailOptions) {
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
    });
    if (error) {
      console.error('[RESEND] Erreur:', error);
      return { ok: false, error };
    }
    return { ok: true };
  } catch (error) {
    console.error('[RESEND] Erreur envoi:', error);
    return { ok: false, error };
  }
}
