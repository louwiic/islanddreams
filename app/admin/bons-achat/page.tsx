import { getAdminVouchers } from '@/lib/actions/vouchers';
import { VouchersClient } from './VouchersClient';

export default async function BonsAchatAdminPage() {
  const vouchers = await getAdminVouchers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bons d’achat</h1>
        <p className="mt-1 text-sm text-gray-500">
          Créez des codes uniques à offrir à un client, avec un montant et une date limite.
        </p>
      </div>

      <VouchersClient initialVouchers={vouchers} />
    </div>
  );
}
