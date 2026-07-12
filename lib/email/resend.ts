import { Resend } from 'resend';

const FROM = process.env.RESEND_FROM || 'Island Dreams <contact@islanddreams.re>';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY est manquante');
  }
  return new Resend(apiKey);
}

function getAudienceId() {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) {
    throw new Error('RESEND_AUDIENCE_ID est manquante');
  }
  return audienceId;
}

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string | string[];
};

export async function sendResendEmail({ to, subject, html, replyTo, bcc }: EmailOptions) {
  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo: replyTo || undefined,
      bcc: bcc || undefined,
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

/* ── Gestion des contacts (Audiences) ─────────────────────── */

export async function addContactToAudience(email: string, firstName?: string) {
  try {
    const resend = getResend();
    const audienceId = getAudienceId();
    await resend.contacts.create({
      audienceId,
      email,
      firstName: firstName || undefined,
      unsubscribed: false,
    });
    console.log(`[RESEND] Contact ajouté à l'audience: ${email}`);
  } catch (error) {
    console.error('[RESEND] Erreur ajout contact:', error);
  }
}

export async function removeContactFromAudience(email: string) {
  try {
    const resend = getResend();
    const audienceId = getAudienceId();
    // Chercher l'ID du contact
    const contacts = await resend.contacts.list({ audienceId });
    const contact = contacts.data?.data?.find((c: { email: string }) => c.email === email);
    if (contact) {
      await resend.contacts.update({
        audienceId,
        id: contact.id,
        unsubscribed: true,
      });
      console.log(`[RESEND] Contact désabonné: ${email}`);
    }
  } catch (error) {
    console.error('[RESEND] Erreur désabonnement contact:', error);
  }
}

/* ── Broadcasts (Campagnes) ────────────────────────────────── */

export type BroadcastStatus = 'draft' | 'sent' | 'queued';

export async function createBroadcast(subject: string, html: string) {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.create({
    audienceId: getAudienceId(),
    from: FROM,
    subject,
    html,
    name: subject,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBroadcast(id: string, subject: string, html: string) {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.update(id, {
    subject,
    name: subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function sendBroadcast(broadcastId: string) {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.send(broadcastId);
  if (error) throw new Error(error.message);
  return data;
}

export async function listBroadcasts() {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.list();
  if (error) throw new Error(error.message);
  return data?.data ?? [];
}

export async function getBroadcast(id: string) {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.get(id);
  if (error) throw new Error(error.message);
  return data;
}

export async function removeBroadcast(id: string) {
  const resend = getResend();
  const { data, error } = await resend.broadcasts.remove(id);
  if (error) throw new Error(error.message);
  return data;
}
