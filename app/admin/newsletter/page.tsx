import { createClient } from '@supabase/supabase-js';
import { Mail, Users, UserX, Clock } from 'lucide-react';
import Link from 'next/link';
import { DeleteSubscriberButton, ExportCsvButton } from './NewsletterActions';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function NewsletterPage() {
  const { data: subscribers } = await admin
    .from('newsletter_subscribers')
    .select('*')
    .order('created_at', { ascending: false });

  const all = subscribers ?? [];
  const active = all.filter((s) => !s.unsubscribed_at);
  const unsubscribed = all.filter((s) => s.unsubscribed_at);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestion des abonnés et campagnes email
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportCsvButton />
          <Link
            href="/admin/newsletter/campagnes"
            className="flex items-center gap-2 px-4 py-2 bg-jungle-600 text-white rounded-lg text-sm font-semibold hover:bg-jungle-700 transition-colors"
          >
            <Mail size={16} />
            Campagnes
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-jungle-100 flex items-center justify-center">
            <Users size={20} className="text-jungle-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{all.length}</p>
            <p className="text-xs text-gray-500">Total abonnés</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <Mail size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{active.length}</p>
            <p className="text-xs text-gray-500">Actifs</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <UserX size={20} className="text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{unsubscribed.length}</p>
            <p className="text-xs text-gray-500">Désinscrits</p>
          </div>
        </div>
      </div>

      {/* Liste */}
      {all.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Mail size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun abonné pour le moment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Inscription</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-12"></th>
              </tr>
            </thead>
            <tbody>
              {all.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-gray-900">{sub.email}</p>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock size={12} />
                      {new Date(sub.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    {sub.unsubscribed_at ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                        Désinscrit
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700">
                        Actif
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <DeleteSubscriberButton id={sub.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
