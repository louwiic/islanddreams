import { NextRequest, NextResponse } from 'next/server';
import { calculateTaxQuote } from '@/lib/tax/calculator';
import { getTaxConfiguration } from '@/lib/tax/settings';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  const configuration = await getTaxConfiguration();
  const supabase = createAdminClient();
  const { data: enabledZones } = await supabase
    .from('shipping_zones')
    .select('id')
    .eq('enabled', true);
  const zoneIds = (enabledZones ?? []).map((zone) => zone.id);
  const { data: shippingCountries } = zoneIds.length > 0
    ? await supabase
        .from('shipping_zone_postcodes')
        .select('country')
        .in('zone_id', zoneIds)
    : { data: [] };
  const countries = [...new Set(
    [
      ...configuration.zones
        .filter((zone) => zone.enabled)
        .flatMap((zone) => zone.countries),
      ...(shippingCountries ?? []).map((row) => row.country),
    ]
      .filter((country) => country !== '*')
  )];

  return NextResponse.json({ countries });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const configuration = await getTaxConfiguration();
    const quote = calculateTaxQuote({
      config: configuration,
      country: String(body.country || 'RE'),
      postalCode: String(body.postalCode || ''),
      catalogSubtotal: Math.max(0, Number(body.catalogSubtotal) || 0),
      shipping: Math.max(0, Number(body.shipping) || 0),
      discountPercent: Math.max(0, Number(body.discountPercent) || 0),
      discountAmount: Math.max(0, Number(body.discountAmount) || 0),
    });

    return NextResponse.json({ quote });
  } catch {
    return NextResponse.json({ error: 'Calcul des taxes impossible.' }, { status: 400 });
  }
}
