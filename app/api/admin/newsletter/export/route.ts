import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('newsletter_subscribers')
    .select('email, subscribed_at, unsubscribed_at')
    .order('subscribed_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const csv = [
    'Email,Date inscription,Statut',
    ...rows.map((r) => {
      const date = r.subscribed_at
        ? new Date(r.subscribed_at).toLocaleDateString('fr-FR')
        : '';
      const statut = r.unsubscribed_at ? 'Désinscrit' : 'Actif';
      return `${r.email},${date},${statut}`;
    }),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
