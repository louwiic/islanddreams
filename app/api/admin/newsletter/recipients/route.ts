import { NextResponse } from 'next/server';
import { getNewsletterRecipientGroups } from '@/lib/newsletter/recipients';

export async function GET() {
  try {
    const groups = await getNewsletterRecipientGroups(['newsletter', 'contacts', 'contest']);
    return NextResponse.json({
      groups: groups.map((group) => ({
        source: group.source,
        label: group.label,
        description: group.description,
        count: group.emails.length,
        preview: group.emails.slice(0, 8),
      })),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
