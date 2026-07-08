'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

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

/* ── Installer / mettre à jour Colissimo Réunion → métropole ─────── */

const METRO_COLISSIMO_RATES_2026 = [
  { maxWeightG: 500, cost: 8.41 },
  { maxWeightG: 1000, cost: 11.73 },
  { maxWeightG: 2000, cost: 14.77 },
  { maxWeightG: 5000, cost: 24.8 },
  { maxWeightG: 10000, cost: 39.24 },
  { maxWeightG: 15000, cost: 79.42 },
  { maxWeightG: 30000, cost: 91.53 },
];

export async function installMetropoleColissimoRates() {
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

  const { error: deleteError } = await supabase
    .from('shipping_methods')
    .delete()
    .eq('zone_id', zoneId)
    .ilike('name', 'Colissimo Eco Outre-mer%');

  if (deleteError) return { error: deleteError.message };

  const rows = METRO_COLISSIMO_RATES_2026.map((rate, index) => ({
    zone_id: zoneId,
    name: `Colissimo Eco Outre-mer jusqu’à ${rate.maxWeightG >= 1000 ? `${rate.maxWeightG / 1000} kg` : `${rate.maxWeightG} g`}`,
    cost: rate.cost,
    free_above: null,
    requires_signature: false,
    enabled: true,
    sort_order: index + 1,
    min_weight_g: index === 0 ? 1 : METRO_COLISSIMO_RATES_2026[index - 1].maxWeightG + 1,
    max_weight_g: rate.maxWeightG,
  }));

  const { error: insertError } = await supabase
    .from('shipping_methods')
    .insert(rows as never);

  if (insertError) return { error: insertError.message };

  revalidatePath('/admin/livraison');
  revalidatePath('/panier');
  return { success: true, count: rows.length };
}

/* ── Supprimer une méthode de livraison ─────────────────── */

export async function deleteShippingMethod(id: string) {
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
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('shipping_zones')
    .update({ enabled })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/livraison');
  return { success: true };
}
