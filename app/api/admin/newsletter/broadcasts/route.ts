import { NextRequest, NextResponse } from 'next/server';
import {
  addContactToAudience,
  createBroadcast,
  listBroadcasts,
  removeBroadcast,
  updateBroadcast,
} from '@/lib/email/resend';
import { deleteLocalBroadcastDraft, saveLocalBroadcastDraft } from '@/lib/newsletter/broadcast-drafts';
import { getNewsletterRecipients } from '@/lib/newsletter/recipients';

// GET — liste des campagnes
export async function GET() {
  try {
    const broadcasts = await listBroadcasts();
    return NextResponse.json({ broadcasts });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST — créer une campagne
export async function POST(req: NextRequest) {
  try {
    const { id, subject, html, recipientSources } = await req.json();
    if (!subject || !html) {
      return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
    }

    const { emails, groups } = await getNewsletterRecipients(recipientSources);
    if (emails.length === 0) {
      return NextResponse.json({ error: 'Aucun destinataire actif pour cette sélection' }, { status: 400 });
    }

    for (const email of emails) {
      await addContactToAudience(email);
    }

    const broadcast = id
      ? await updateBroadcast(id, subject, html)
      : await createBroadcast(subject, html);
    const draftId = id || broadcast?.id;

    if (draftId) {
      await saveLocalBroadcastDraft({
        id: draftId,
        subject,
        html,
        recipientSources,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      broadcast,
      id: draftId,
      recipientsCount: emails.length,
      recipientsGroups: groups.map((group) => ({
        source: group.source,
        count: group.emails.length,
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE — supprimer une campagne
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    await removeBroadcast(id);
    await deleteLocalBroadcastDraft(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
