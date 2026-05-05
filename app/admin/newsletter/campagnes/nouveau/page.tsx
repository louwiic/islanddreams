import Link from 'next/link';
import { CampaignForm } from '../CampaignForm';

export default function NewCampaignPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Link href="/admin/newsletter" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Newsletter
          </Link>
          <span className="text-gray-300">/</span>
          <Link href="/admin/newsletter/campagnes" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Campagnes
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm font-semibold text-gray-700">Nouvelle</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle campagne</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <CampaignForm />
      </div>
    </div>
  );
}
