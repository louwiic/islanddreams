import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET() {
  const { data, error } = await admin
    .from('newsletter_subscribers')
    .select('email, created_at, unsubscribed_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const csv = [
    'Email,Date inscription,Statut',
    ...rows.map((r) => {
      const date = new Date(r.created_at).toLocaleDateString('fr-FR');
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
