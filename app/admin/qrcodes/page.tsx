import { getQrCampaigns, getQrConversions, getQrStats } from '@/lib/actions/qr';
import { QrCampaignsClient } from './QrCampaignsClient';

export default async function QrCodesAdminPage() {
  const [campaigns, stats, conversions] = await Promise.all([getQrCampaigns(), getQrStats(), getQrConversions()]);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.islanddreams.re';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">QR codes trackés</h1>
        <p className="mt-1 text-sm text-gray-500">
          Créez des QR codes par source pour suivre les scans de vos supports physiques.
        </p>
      </div>

      <QrCampaignsClient
        initialCampaigns={campaigns}
        initialStats={stats}
        siteUrl={siteUrl.replace(/\/$/, '')}
        initialConversions={conversions}
      />
    </div>
  );
}
