import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';
import { contactNotification } from '@/lib/email/templates';

export async function POST(req: NextRequest) {
  const admin = createAdminClient();
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

  // Notification email à l'admin (configurable via ADMIN_EMAIL)
  const adminEmail = process.env.ADMIN_EMAIL || 'contact@islanddreams.re';
  const tpl = contactNotification({ nom, email, telephone, objet: objet || 'Sans objet', message });
  await sendEmail({ to: adminEmail, ...tpl, replyTo: email });

  return NextResponse.json({ success: true });
}
