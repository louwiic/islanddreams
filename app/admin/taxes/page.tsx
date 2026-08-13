import { getTaxConfiguration } from '@/lib/tax/settings';
import { TaxManager } from '@/components/admin/TaxManager';

export default async function TaxesPage() {
  const configuration = await getTaxConfiguration();
  return <TaxManager initialConfiguration={configuration} />;
}
