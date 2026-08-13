'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeTaxConfiguration } from '@/lib/tax/calculator';
import { TAX_CONFIGURATION_KEY } from '@/lib/tax/settings';
import type { TaxConfiguration } from '@/lib/tax/types';

export async function saveTaxConfiguration(configuration: TaxConfiguration) {
  await requireAdmin();
  const normalized = normalizeTaxConfiguration(configuration);

  if (!normalized.zones.some((zone) => zone.enabled && zone.countries.includes('*'))) {
    return { error: 'Ajoutez une zone de secours avec le pays « * ».' };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('shop_settings').upsert(
    { key: TAX_CONFIGURATION_KEY, value: normalized },
    { onConflict: 'key' }
  );

  if (error) return { error: error.message };

  revalidatePath('/admin/taxes');
  revalidatePath('/panier');
  revalidatePath('/boutique');
  revalidatePath('/');
  return { success: true };
}
