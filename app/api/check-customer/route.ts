import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ exists: false });
  }

  // Vérifier si l'email existe dans la table customers (migré depuis Woo)
  const { data: customer } = await admin
    .from('customers')
    .select('id, auth_user_id')
    .eq('email', email.toLowerCase())
    .single();

  if (!customer) {
    return NextResponse.json({ exists: false });
  }

  // Vérifier si un compte Supabase Auth existe déjà
  const hasAuth = !!customer.auth_user_id;

  return NextResponse.json({ exists: true, hasAuth });
}
