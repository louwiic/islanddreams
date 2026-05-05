import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CampaignForm } from '../CampaignForm';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: campaign } = await admin
    .from('newsletter_campaigns')
    .select('*')
    .eq('id', id)
    .single();

  if (!campaign) notFound();

  if (campaign.status === 'sent') {
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
            <span className="text-sm font-semibold text-gray-700">Détails</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.subject}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Envoyée le {new Date(campaign.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            {' '}à {campaign.recipients_count} destinataire{campaign.recipients_count > 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: campaign.content }} />
        </div>
      </div>
    );
  }

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
          <span className="text-sm font-semibold text-gray-700">Modifier</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier la campagne</h1>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <CampaignForm initial={{ id: campaign.id, subject: campaign.subject, content: campaign.content }} />
      </div>
    </div>
  );
}
