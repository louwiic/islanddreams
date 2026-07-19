import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { CartItem } from '@/lib/cart/types';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  if (!UUID.test(token)) return NextResponse.json({ error: 'Lien invalide.' }, { status: 400 });
  const { data } = await (createAdminClient() as any).from('abandoned_carts')
    .select('items,email,customer_name,status,expires_at').eq('recovery_token', token).maybeSingle();
  if (!data || !['active', 'sending'].includes(data.status) || new Date(data.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: 'Ce panier n’est plus disponible.' }, { status: 404 });
  }
  return NextResponse.json({ items: data.items, email: data.email, customerName: data.customer_name });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { token?: string; email?: string; customerName?: string; items?: CartItem[]; total?: number; consent?: boolean };
  const email = body.email?.trim().toLowerCase() || '';
  if (!body.consent || !body.token || !UUID.test(body.token) || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'Consentement et email valide requis.' }, { status: 400 });
  }
  const items = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
  if (!items.length) return NextResponse.json({ error: 'Panier vide.' }, { status: 400 });
  const now = new Date();
  const { error } = await (createAdminClient() as any).from('abandoned_carts').upsert({
    recovery_token: body.token,
    email,
    customer_name: body.customerName?.trim().slice(0, 120) || null,
    items,
    cart_total: Math.max(0, Number(body.total) || 0),
    consent_at: now.toISOString(),
    status: 'active',
    next_reminder_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    expires_at: new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
  }, { onConflict: 'recovery_token' });
  if (error) return NextResponse.json({ error: 'Service de rappel indisponible.' }, { status: 503 });
  return NextResponse.json({ saved: true });
}

export async function DELETE(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  if (UUID.test(token)) await (createAdminClient() as any).from('abandoned_carts').update({ status: 'cancelled', next_reminder_at: null, updated_at: new Date().toISOString() }).eq('recovery_token', token);
  return NextResponse.json({ cancelled: true });
}
