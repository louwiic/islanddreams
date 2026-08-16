'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth/admin';

/* ── Types ───────────────────────────────────────────────── */

export type ShippingZone = {
  id: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  enabled: boolean | null;
  postcodes: { id: string; country: string; postcode_pattern: string }[];
  methods: {
    id: string;
    name: string;
    cost: number;
    free_above: number | null;
    min_weight_g?: number | null;
    max_weight_g?: number | null;
    requires_signature: boolean | null;
    enabled: boolean | null;
    sort_order: number | null;
  }[];
};

/* ── Lire toutes les zones (admin) ───────────────────────── */

export async function getShippingZones(): Promise<ShippingZone[]> {
  const supabase = createAdminClient();

  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('*')
    .order('sort_order');

  if (!zones) return [];

  const zoneIds = zones.map((z) => z.id);

  const [postcodes, methods] = await Promise.all([
    supabase.from('shipping_zone_postcodes').select('*').in('zone_id', zoneIds),
    supabase.from('shipping_methods').select('*').in('zone_id', zoneIds).order('sort_order'),
  ]);

  return zones.map((z) => ({
    ...z,
    postcodes: (postcodes.data ?? []).filter((p) => p.zone_id === z.id),
    methods: (methods.data ?? []).filter((m) => m.zone_id === z.id),
  }));
}

/* ── Calculer les frais de livraison (public) ────────────── */

type ShippingOption = {
  zone: string;
  methods: { id: string; name: string; cost: number; requiresSignature: boolean }[];
};

function matchesPostalCode(postalCode: string, country: string, pc: { country: string; postcode_pattern: string }): boolean {
  if (pc.country !== country && pc.country !== '*') return false;

  if (pc.postcode_pattern === '*') return true;

  if (pc.postcode_pattern.includes('-')) {
    const [start, end] = pc.postcode_pattern.split('-');
    const code = parseInt(postalCode);
    return code >= parseInt(start) && code <= parseInt(end);
  }

  if (pc.postcode_pattern.endsWith('*')) {
    return postalCode.startsWith(pc.postcode_pattern.slice(0, -1));
  }

  return postalCode === pc.postcode_pattern;
}

export async function calculateShipping(
  country: string,
  postalCode: string,
  cartWeightG?: number
): Promise<ShippingOption[] | null> {
  const supabase = await createClient();

  const { data: zones } = await supabase
    .from('shipping_zones')
    .select('id, name')
    .eq('enabled', true)
    .order('sort_order');

  if (!zones) return null;

  const { data: allPostcodes } = await supabase
    .from('shipping_zone_postcodes')
    .select('zone_id, country, postcode_pattern');

  // Trouver TOUTES les zones correspondantes (livraison propre + La Poste)
  const matchedZoneIds: { id: string; name: string }[] = [];

  for (const zone of zones) {
    const zonePostcodes = (allPostcodes ?? []).filter((p) => p.zone_id === zone.id);
    const matches = zonePostcodes.some((pc) => matchesPostalCode(postalCode, country, pc));
    if (matches) matchedZoneIds.push({ id: zone.id, name: zone.name });
  }

  if (matchedZoneIds.length === 0) return null;

  const { data: rawMethods } = await supabase
    .from('shipping_methods')
    .select('*')
    .in('zone_id', matchedZoneIds.map((z) => z.id))
    .eq('enabled', true)
    .order('sort_order');

  const allMethods = (rawMethods ?? []) as unknown as { id: string; name: string; cost: number; requires_signature: boolean | null; zone_id: string; min_weight_g: number | null; max_weight_g: number | null }[];

  const normalizedCountry = country.toUpperCase();

  // Séparer méthodes avec poids (La Poste) et sans poids (livraison propre)
  const isWeightBased = (m: { min_weight_g: number | null; max_weight_g: number | null }) =>
    m.min_weight_g != null || m.max_weight_g != null;

  // Réunion : garder la logique existante. Métropole : toujours proposer les tranches Colissimo au poids.
  const usePostal =
    normalizedCountry === 'FR'
      ? cartWeightG != null && cartWeightG > 0
      : cartWeightG != null && cartWeightG > 0 && cartWeightG < 1000;
  const useOwnDelivery =
    normalizedCountry === 'FR'
      ? cartWeightG == null || cartWeightG === 0
      : cartWeightG == null || cartWeightG === 0 || cartWeightG >= 1000;

  const result: ShippingOption[] = [];

  for (const zone of matchedZoneIds) {
    const zoneMethods = allMethods
      .filter((m) => m.zone_id === zone.id)
      .filter((m) => {
        if (isWeightBased(m)) {
          // Méthode La Poste — afficher uniquement si poids < 1000g et dans la bonne tranche
          if (!usePostal) return false;
          if (!cartWeightG) return false;
          return cartWeightG >= (m.min_weight_g ?? 0) && cartWeightG <= (m.max_weight_g ?? Infinity);
        } else {
          // Livraison propre — afficher uniquement si poids >= 1000g ou poids inconnu
          return useOwnDelivery;
        }
      })
      .map((m) => ({
        id: m.id,
        name: m.name,
        cost: m.cost,
        requiresSignature: m.requires_signature ?? false,
      }));

    if (zoneMethods.length > 0) {
      result.push({ zone: zone.name, methods: zoneMethods });
    }
  }

  return result.length > 0 ? result : null;
}

/* ── Mettre à jour le coût d'une méthode ─────────────────── */

export async function updateShippingMethod(
  id: string,
  data: { name?: string; cost?: number; freeAbove?: number | null; enabled?: boolean; requiresSignature?: boolean }
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_methods')
    .update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.cost !== undefined && { cost: data.cost }),
      ...(data.freeAbove !== undefined && { free_above: data.freeAbove }),
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.requiresSignature !== undefined && { requires_signature: data.requiresSignature }),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  return { success: true };
}

/* ── Créer une méthode de livraison ──────────────────────── */

export async function createShippingMethod(
  zoneId: string,
  data: { name: string; cost: number; freeAbove?: number | null; requiresSignature?: boolean }
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_methods')
    .insert({
      zone_id: zoneId,
      name: data.name,
      cost: data.cost,
      free_above: data.freeAbove ?? null,
      requires_signature: data.requiresSignature ?? false,
      enabled: true,
    });

  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  return { success: true };
}

/* ── Créer / supprimer une zone de livraison ──────────────────── */

export async function createShippingZone(data: {
  name: string;
  country: string;
  postcodePattern?: string;
}) {
  await requireAdmin();
  const supabase = createAdminClient();
  const name = data.name.trim();
  const country = data.country.trim().toUpperCase();
  const postcodePattern = data.postcodePattern?.trim().toUpperCase() || '*';

  if (!name || !/^[A-Z]{2}$/.test(country)) {
    return { error: 'Indiquez un nom et un code pays ISO composé de 2 lettres.' };
  }

  const { data: existing } = await supabase
    .from('shipping_zones')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);

  const { data: zone, error: zoneError } = await supabase
    .from('shipping_zones')
    .insert({
      name,
      description: `Livraison vers ${name}`,
      enabled: true,
      sort_order: (existing?.[0]?.sort_order ?? 0) + 10,
    })
    .select('id')
    .single();

  if (zoneError || !zone) return { error: zoneError?.message || 'Création impossible.' };

  const { error: postcodeError } = await supabase.from('shipping_zone_postcodes').insert({
    zone_id: zone.id,
    country,
    postcode_pattern: postcodePattern,
  });

  if (postcodeError) {
    await supabase.from('shipping_zones').delete().eq('id', zone.id);
    return { error: postcodeError.message };
  }

  revalidatePath('/admin/livraison');
  revalidatePath('/panier');
  return { success: true };
}

export async function deleteShippingZone(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error: methodsError } = await supabase.from('shipping_methods').delete().eq('zone_id', id);
  if (methodsError) return { error: methodsError.message };

  const { error: postcodesError } = await supabase.from('shipping_zone_postcodes').delete().eq('zone_id', id);
  if (postcodesError) return { error: postcodesError.message };

  const { error } = await supabase.from('shipping_zones').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  revalidatePath('/panier');
  return { success: true };
}

/* ── Installer / mettre à jour Colissimo Réunion → métropole ─────── */

const METRO_COLISSIMO_RATES_2026 = [
  { maxWeightG: 500, withoutSignature: 11.43, withSignature: 15.59 },
  { maxWeightG: 1000, withoutSignature: 17.33, withSignature: 19.99 },
  { maxWeightG: 2000, withoutSignature: 23.61, withSignature: 26.96 },
  { maxWeightG: 3000, withoutSignature: 29.91, withSignature: 33.92 },
  { maxWeightG: 4000, withoutSignature: 36.2, withSignature: 39.41 },
  { maxWeightG: 5000, withoutSignature: 40.64, withSignature: 45.73 },
  { maxWeightG: 6000, withoutSignature: 48.81, withSignature: 54.81 },
  { maxWeightG: 7000, withoutSignature: 55.07, withSignature: 61.78 },
  { maxWeightG: 8000, withoutSignature: 59.96, withSignature: 65.73 },
  { maxWeightG: 9000, withoutSignature: 65.94, withSignature: 72.4 },
  { maxWeightG: 10000, withoutSignature: 73.1, withSignature: 79.05 },
  { maxWeightG: 15000, withoutSignature: 102.43, withSignature: 112.35 },
  { maxWeightG: 20000, withoutSignature: 131.81, withSignature: 140.08 },
  { maxWeightG: 25000, withoutSignature: 164.89, withSignature: 170.99 },
  { maxWeightG: 30000, withoutSignature: 199.25, withSignature: 203.29 },
];

export async function installMetropoleColissimoRates() {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: existingZone, error: zoneReadError } = await supabase
    .from('shipping_zones')
    .select('id')
    .eq('name', 'France métropolitaine')
    .maybeSingle();

  if (zoneReadError) return { error: zoneReadError.message };

  let zoneId = existingZone?.id;
  if (!zoneId) {
    const { data: createdZone, error: zoneCreateError } = await supabase
      .from('shipping_zones')
      .insert({
        name: 'France métropolitaine',
        description: 'Livraison Colissimo Eco Outre-mer depuis La Réunion vers la France métropolitaine.',
        enabled: true,
        sort_order: 50,
      })
      .select('id')
      .single();

    if (zoneCreateError) return { error: zoneCreateError.message };
    zoneId = createdZone.id;
  }

  const { data: existingPostcode } = await supabase
    .from('shipping_zone_postcodes')
    .select('id')
    .eq('zone_id', zoneId)
    .eq('country', 'FR')
    .eq('postcode_pattern', '*')
    .maybeSingle();

  if (!existingPostcode) {
    const { error: postcodeError } = await supabase.from('shipping_zone_postcodes').insert({
      zone_id: zoneId,
      country: 'FR',
      postcode_pattern: '*',
    });
    if (postcodeError) return { error: postcodeError.message };
  }

  const { data: previousMethods, error: previousMethodsError } = await supabase
    .from('shipping_methods')
    .select('id, name')
    .eq('zone_id', zoneId);

  if (previousMethodsError) return { error: previousMethodsError.message };

  const previousMethodIds = (previousMethods ?? [])
    .filter((method) =>
      method.name.startsWith('Colissimo Eco Outre-mer') ||
      method.name.startsWith('Colissimo Domicile')
    )
    .map((method) => method.id);

  const rows = METRO_COLISSIMO_RATES_2026.flatMap((rate, index) => {
    const weightLabel = rate.maxWeightG >= 1000
      ? `${rate.maxWeightG / 1000} kg`
      : `${rate.maxWeightG} g`;
    const common = {
      zone_id: zoneId,
      free_above: null,
      enabled: true,
      min_weight_g: index === 0 ? 1 : METRO_COLISSIMO_RATES_2026[index - 1].maxWeightG + 1,
      max_weight_g: rate.maxWeightG,
    };

    return [
      {
        ...common,
        name: `Colissimo Domicile sans signature jusqu’à ${weightLabel}`,
        cost: rate.withoutSignature,
        requires_signature: false,
        sort_order: index * 2 + 1,
      },
      {
        ...common,
        name: `Colissimo Domicile avec signature jusqu’à ${weightLabel}`,
        cost: rate.withSignature,
        requires_signature: true,
        sort_order: index * 2 + 2,
      },
    ];
  });

  const { data: insertedMethods, error: insertError } = await supabase
    .from('shipping_methods')
    .insert(rows as never)
    .select('id');

  if (insertError) return { error: insertError.message };

  const { error: deleteError } = previousMethodIds.length > 0
    ? await supabase.from('shipping_methods').delete().in('id', previousMethodIds)
    : { error: null };

  if (deleteError) {
    const insertedIds = (insertedMethods ?? []).map((method) => method.id);
    if (insertedIds.length > 0) {
      await supabase.from('shipping_methods').delete().in('id', insertedIds);
    }
    return { error: deleteError.message };
  }

  revalidatePath('/admin/livraison');
  revalidatePath('/panier');
  return { success: true, count: rows.length };
}

/* ── Supprimer une méthode de livraison ─────────────────── */

export async function deleteShippingMethod(id: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_methods')
    .delete()
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  return { success: true };
}

/* ── Toggle zone ─────────────────────────────────────────── */

export async function toggleShippingZone(id: string, enabled: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_zones')
    .update({ enabled })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  return { success: true };
}
