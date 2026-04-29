import { createClient } from '@supabase/supabase-js';
import { Mail, Phone, Clock, CheckCheck } from 'lucide-react';
import { MarkReadButton, DeleteMessageButton } from './MarkReadButton';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export default async function MessagesPage() {
  const { data: messages } = await admin
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  const unread = (messages ?? []).filter(m => !m.is_read).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages contact</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unread > 0
              ? <span className="text-blue-600 font-semibold">{unread} non lu{unread > 1 ? 's' : ''}</span>
              : 'Tous les messages sont lus'}
            {' '}· {(messages ?? []).length} au total
          </p>
        </div>
      </div>

      {(messages ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Mail size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {(messages ?? []).map((msg) => (
            <div
              key={msg.id}
              className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
                msg.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/30'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-5 pt-4 pb-3">
                <div className="flex items-start gap-3 min-w-0">
                  {/* Avatar initiale */}
                  <div className="w-10 h-10 rounded-full bg-jungle-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-jungle-700 font-bold text-sm uppercase">
                      {msg.nom.charAt(0)}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-gray-900 text-sm">{msg.nom}</p>
                      {!msg.is_read && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs text-gray-500 hover:text-jungle-600 transition-colors flex items-center gap-1"
                      >
                        <Mail size={11} />
                        {msg.email}
                      </a>
                      {msg.telephone && (
                        <a
                          href={`tel:${msg.telephone}`}
                          className="text-xs text-gray-500 hover:text-jungle-600 transition-colors flex items-center gap-1"
                        >
                          <Phone size={11} />
                          {msg.telephone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1 text-[11px] text-gray-400">
                    <Clock size={11} />
                    {new Date(msg.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>

              {/* Objet */}
              {msg.objet && (
                <div className="px-5 pb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {msg.objet}
                  </p>
                </div>
              )}

              {/* Message */}
              <div className="px-5 pb-4">
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {msg.message}
                </p>
              </div>

              {/* Footer actions */}
              <div className="border-t border-gray-100 px-5 py-2.5 flex items-center justify-between bg-gray-50/50">
                <a
                  href={`mailto:${msg.email}?subject=Re: ${msg.objet ?? 'Votre message'}`}
                  className="text-xs font-semibold text-jungle-700 hover:text-jungle-800 transition-colors"
                >
                  Répondre par email →
                </a>
                <div className="flex items-center gap-4">
                  {!msg.is_read && <MarkReadButton id={msg.id} />}
                  {msg.is_read && (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <CheckCheck size={12} /> Lu
                    </span>
                  )}
                  <DeleteMessageButton id={msg.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
