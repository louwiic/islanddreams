import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send';

export async function GET() {
  console.log('[TEST-EMAIL] Envoi test à louwiic@gmail.com...');
  console.log('[TEST-EMAIL] Host:', process.env.SMTP_HOST);
  console.log('[TEST-EMAIL] Port:', process.env.SMTP_PORT);
  console.log('[TEST-EMAIL] User:', process.env.SMTP_USER);
  console.log('[TEST-EMAIL] Pass length:', process.env.SMTP_PASS?.length, 'last char:', process.env.SMTP_PASS?.slice(-1));

  const result = await sendEmail({
    to: 'louwiic@gmail.com',
    subject: 'Test Island Dreams - ça marche !',
    html: '<h1>Test réussi !</h1><p>Les emails SMTP fonctionnent.</p>',
  });

  console.log('[TEST-EMAIL] Résultat:', result);

  return NextResponse.json(result);
}
