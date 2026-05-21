import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getBroadcast } from '@/lib/email/resend';

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let broadcast;
  try {
    broadcast = await getBroadcast(id);
  } catch {
    notFound();
  }

  if (!broadcast) notFound();

  if (broadcast.status === 'sent' || broadcast.status === 'queued') {
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
          <h1 className="text-2xl font-bold text-gray-900">{broadcast.name}</h1>
          {broadcast.sent_at && (
            <p className="text-sm text-gray-500 mt-1">
              Envoyée le {new Date(broadcast.sent_at).toLocaleDateString('fr-FR', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
              Envoyée
            </span>
            <span>Sujet : <strong className="text-ink">{broadcast.name}</strong></span>
          </div>
          <p className="text-xs text-gray-400 italic">
            Le contenu HTML n&apos;est pas récupérable depuis Resend après envoi.
          </p>
          <Link
            href="/admin/newsletter/campagnes"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-jungle-600 hover:text-jungle-700 transition-colors"
          >
            ← Retour aux campagnes
          </Link>
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
        {/* Resend ne retourne pas le HTML du brouillon — on repart de zéro */}
        <p className="text-xs text-gray-400 mb-4 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
          Le contenu HTML n&apos;est pas récupérable depuis Resend. Re-saisi le contenu ci-dessous — l&apos;ancien brouillon sera remplacé.
        </p>
        {/* Import dynamique pour éviter le problème de SSR */}
        <CampaignFormWrapper id={broadcast.id} name={broadcast.name} />
      </div>
    </div>
  );
}

// Import client-side
import { CampaignForm } from '../CampaignForm';

function CampaignFormWrapper({ id, name }: { id: string; name: string }) {
  return <CampaignForm initial={{ id, name }} />;
}
