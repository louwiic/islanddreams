import { createAdminClient } from '@/lib/supabase/admin';
import { DEFAULT_TAX_CONFIGURATION, normalizeTaxConfiguration } from './calculator';
import type { TaxConfiguration } from './types';

export const TAX_CONFIGURATION_KEY = 'tax_configuration';

export async function getTaxConfiguration(): Promise<TaxConfiguration> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', TAX_CONFIGURATION_KEY)
    .maybeSingle();

  if (error || !data) return DEFAULT_TAX_CONFIGURATION;
  return normalizeTaxConfiguration(data.value);
}
