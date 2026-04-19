import { getSettings } from '@/lib/actions/settings';
import { SeoManager } from '@/components/admin/SeoManager';

export default async function SeoPage() {
  const settings = await getSettings();
  return <SeoManager initialSettings={settings} />;
}
