'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

/** Lire tous les settings */
export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('shop_settings').select('key, value');

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    // value est stocké en JSON, on le parse
    settings[row.key] = typeof row.value === 'string' ? row.value : JSON.stringify(row.value);
  }
  return settings;
}

/** Lire un setting */
export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (!data) return null;
  return typeof data.value === 'string' ? data.value : JSON.stringify(data.value);
}

/** Mettre à jour des settings (upsert) */
export async function updateSettings(settings: Record<string, string>) {
  const supabase = createAdminClient();

  for (const [key, value] of Object.entries(settings)) {
    await supabase
      .from('shop_settings')
      .upsert(
        { key, value: JSON.parse(`"${value.replace(/"/g, '\\"')}"`) },
        { onConflict: 'key' }
      );
  }

  revalidatePath('/admin/seo');
  revalidatePath('/admin/parametres');
  revalidatePath('/');
  return { success: true };
}
