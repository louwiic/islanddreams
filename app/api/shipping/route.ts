import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '@/lib/actions/shipping';

export async function GET(req: NextRequest) {
  const country = req.nextUrl.searchParams.get('country') || 'RE';
  const postalCode = req.nextUrl.searchParams.get('postal_code') || '';

  if (!postalCode) {
    return NextResponse.json({ error: 'postal_code requis' }, { status: 400 });
  }

  const result = await calculateShipping(country, postalCode);

  if (!result) {
    return NextResponse.json(
      { error: 'Aucune zone de livraison pour cette adresse' },
      { status: 404 }
    );
  }

  return NextResponse.json(result);
}
