import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email/send';
import { contactNotification } from '@/lib/email/templates';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { nom, telephone, email, objet, message } = await req.json();

  if (!nom || !email || !message) {
    return NextResponse.json({ error: 'Champs obligatoires manquants.' }, { status: 400 });
  }

  const { error } = await admin.from('contact_messages').insert({
    nom,
    telephone: telephone || null,
    email,
    objet: objet || null,
    message,
  });

  if (error) {
    console.error('contact insert error:', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }

  // Notification email à l'admin
  const tpl = contactNotification({ nom, email, telephone, objet: objet || 'Sans objet', message });
  await sendEmail({ to: 'contact@islanddreams.re', ...tpl, replyTo: email });

  return NextResponse.json({ success: true });
}
