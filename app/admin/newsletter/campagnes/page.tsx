import { createClient } from '@supabase/supabase-js';
import { Mail, Plus, Send, Clock, Users } from 'lucide-react';
import Link from 'next/link';
import { DeleteCampaignButton, SendCampaignButton } from './CampaignActions';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function CampaignsPage() {
  const [{ data: campaigns }, { count: activeCount }] = await Promise.all([
    admin
      .from('newsletter_campaigns')
      .select('*')
      .order('created_at', { ascending: false }),
    admin
      .from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true })
      .is('unsubscribed_at', null),
  ]);

  const all = campaigns ?? [];
  const drafts = all.filter((c) => c.status === 'draft');
  const sent = all.filter((c) => c.status === 'sent');

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin/newsletter" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Newsletter
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-sm font-semibold text-gray-700">Campagnes</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Campagnes email</h1>
        </div>
        <Link
          href="/admin/newsletter/campagnes/nouveau"
          className="flex items-center gap-2 px-4 py-2 bg-jungle-600 text-white rounded-lg text-sm font-semibold hover:bg-jungle-700 transition-colors"
        >
          <Plus size={16} />
          Nouvelle campagne
        </Link>
      </div>

      <p className="text-sm text-gray-500 mb-6">
        <Users size={14} className="inline -mt-0.5 mr-1" />
        {activeCount ?? 0} abonné{(activeCount ?? 0) > 1 ? 's' : ''} actif{(activeCount ?? 0) > 1 ? 's' : ''}
      </p>

      {all.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Mail size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucune campagne pour le moment.</p>
          <Link
            href="/admin/newsletter/campagnes/nouveau"
            className="inline-block mt-4 text-sm font-semibold text-jungle-600 hover:text-jungle-700"
          >
            Créer la première campagne →
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Brouillons */}
          {drafts.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Brouillons ({drafts.length})
              </h2>
              <div className="flex flex-col gap-3">
                {drafts.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/newsletter/campagnes/${c.id}`}
                          className="text-sm font-bold text-gray-900 hover:text-jungle-600 transition-colors"
                        >
                          {c.subject}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-700">
                            Brouillon
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(c.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <SendCampaignButton id={c.id} activeCount={activeCount ?? 0} />
                        <DeleteCampaignButton id={c.id} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Envoyées */}
          {sent.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Envoyées ({sent.length})
              </h2>
              <div className="flex flex-col gap-3">
                {sent.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900">{c.subject}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                            <Send size={10} className="mr-1" />
                            Envoyée
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(c.sent_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                          <span className="text-xs text-gray-400">
                            {c.recipients_count} destinataire{c.recipients_count > 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <DeleteCampaignButton id={c.id} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
