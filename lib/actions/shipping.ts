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

export async function calculateShipping(
  country: string,
  postalCode: string
): Promise<{ zone: string; methods: { id: string; name: string; cost: number; requiresSignature: boolean }[] } | null> {
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

  // Trouver la zone correspondante
  let matchedZoneId: string | null = null;
  let matchedZoneName = '';

  for (const zone of zones) {
    const zonePostcodes = (allPostcodes ?? []).filter((p) => p.zone_id === zone.id);

    for (const pc of zonePostcodes) {
      if (pc.country !== country && pc.country !== '*') continue;

      if (pc.postcode_pattern === '*') {
        // Wildcard — match tout le pays
        matchedZoneId = zone.id;
        matchedZoneName = zone.name;
      } else if (pc.postcode_pattern.includes('-')) {
        // Range — ex: 97425-97427
        const [start, end] = pc.postcode_pattern.split('-');
        const code = parseInt(postalCode);
        if (code >= parseInt(start) && code <= parseInt(end)) {
          matchedZoneId = zone.id;
          matchedZoneName = zone.name;
        }
      } else if (pc.postcode_pattern.endsWith('*')) {
        // Prefix — ex: 974*
        const prefix = pc.postcode_pattern.slice(0, -1);
        if (postalCode.startsWith(prefix)) {
          matchedZoneId = zone.id;
          matchedZoneName = zone.name;
        }
      } else {
        // Exact match
        if (postalCode === pc.postcode_pattern) {
          matchedZoneId = zone.id;
          matchedZoneName = zone.name;
        }
      }

      if (matchedZoneId) break;
    }
    if (matchedZoneId) break;
  }

  if (!matchedZoneId) return null;

  const { data: methods } = await supabase
    .from('shipping_methods')
    .select('id, name, cost, requires_signature')
    .eq('zone_id', matchedZoneId)
    .eq('enabled', true)
    .order('sort_order');

  return {
    zone: matchedZoneName,
    methods: (methods ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      cost: m.cost,
      requiresSignature: m.requires_signature ?? false,
    })),
  };
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
