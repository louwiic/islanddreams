import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM || 'Island Dreams <contact@islanddreams.re>';
const AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!;

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  bcc?: string | string[];
};

export async function sendResendEmail({ to, subject, html, replyTo, bcc }: EmailOptions) {
  try {
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
  if (!AUDIENCE_ID) return;
  try {
    await resend.contacts.create({
      audienceId: AUDIENCE_ID,
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
  if (!AUDIENCE_ID) return;
  try {
    // Chercher l'ID du contact
    const contacts = await resend.contacts.list({ audienceId: AUDIENCE_ID });
    const contact = contacts.data?.data?.find((c: { email: string }) => c.email === email);
    if (contact) {
      await resend.contacts.update({
        audienceId: AUDIENCE_ID,
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
  const { data, error } = await resend.broadcasts.create({
    audienceId: AUDIENCE_ID,
    from: FROM,
    subject,
    html,
    name: subject,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBroadcast(id: string, subject: string, html: string) {
  const { data, error } = await resend.broadcasts.update(id, {
    subject,
    name: subject,
    html,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function sendBroadcast(broadcastId: string) {
  const { data, error } = await resend.broadcasts.send(broadcastId);
  if (error) throw new Error(error.message);
  return data;
}

export async function listBroadcasts() {
  const { data, error } = await resend.broadcasts.list();
  if (error) throw new Error(error.message);
  return data?.data ?? [];
}

export async function getBroadcast(id: string) {
  const { data, error } = await resend.broadcasts.get(id);
  if (error) throw new Error(error.message);
  return data;
}

export async function removeBroadcast(id: string) {
  const { data, error } = await resend.broadcasts.remove(id);
  if (error) throw new Error(error.message);
  return data;
}
