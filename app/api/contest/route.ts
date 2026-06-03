import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function settingToString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return '';
}

function isActiveDateRange(startDate: string, endDate: string) {
  const today = new Date().toISOString().slice(0, 10);
  return (!startDate || startDate <= today) && (!endDate || endDate >= today);
}

async function getActiveContest() {
  const { data } = await admin
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'contest_popup_enabled',
      'contest_popup_title',
      'contest_popup_start_date',
      'contest_popup_end_date',
      'contest_popup_question',
      'contest_popup_require_answer',
    ]);

  const settings = Object.fromEntries(
    ((data ?? []) as { key: string; value: unknown }[]).map((row) => [
      row.key,
      settingToString(row.value),
    ])
  );

  const enabled = settings.contest_popup_enabled === 'true' || settings.contest_popup_enabled === '1';
  const title = settings.contest_popup_title || 'Jeu concours Island Dreams';
  const startDate = settings.contest_popup_start_date || '';
  const endDate = settings.contest_popup_end_date || '';

  if (!enabled || !isActiveDateRange(startDate, endDate)) return null;

  return {
    title,
    question: settings.contest_popup_question || '',
    requireAnswer: settings.contest_popup_require_answer === 'true',
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = String(body?.email || '').trim().toLowerCase();
  const answer = String(body?.answer || '').trim();
  const termsAccepted = body?.termsAccepted === true;

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 400 });
  }

  if (!termsAccepted) {
    return NextResponse.json({ error: 'Tu dois accepter les conditions de participation.' }, { status: 400 });
  }

  const contest = await getActiveContest();
  if (!contest) {
    return NextResponse.json({ error: 'Ce jeu concours n’est plus actif.' }, { status: 400 });
  }

  if (contest.question && contest.requireAnswer && !answer) {
    return NextResponse.json({ error: 'La réponse est obligatoire.' }, { status: 400 });
  }

  const object = `Jeu concours - ${contest.title}`;
  const { data: existing } = await admin
    .from('contact_messages')
    .select('id')
    .eq('email', email)
    .eq('objet', object)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ success: true, already: true });
  }

  const message = [
    `Participation au jeu concours : ${contest.title}`,
    contest.question ? `Question : ${contest.question}` : null,
    contest.question ? `Réponse : ${answer || 'Aucune réponse'}` : null,
    'Consentement : conditions acceptées, données utilisables pour la participation et les communications commerciales.',
  ].filter(Boolean).join('\n\n');

  const { error } = await admin.from('contact_messages').insert({
    nom: 'Participation jeu concours',
    telephone: null,
    email,
    objet: object,
    message,
  });

  if (error) {
    console.error('[CONTEST] insert error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
