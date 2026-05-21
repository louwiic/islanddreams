'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Trash2, Star, Copy, Check } from 'lucide-react';

type Review = {
  id: string;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  comment: string;
  is_approved: boolean;
  order_number: string | null;
  created_at: string;
};

export function ReviewsAdmin({ initialReviews }: { initialReviews: Review[] }) {
  const router = useRouter();
  const [reviews] = useState(initialReviews);
  const [copied, setCopied] = useState(false);

  const pending = reviews.filter((r) => !r.is_approved);
  const approved = reviews.filter((r) => r.is_approved);

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm('Supprimer cet avis ?')) return;

    await fetch('/api/admin/avis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    });
    router.refresh();
  };

  const copyLink = () => {
    navigator.clipboard.writeText('https://www.islanddreams.re/avis');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Lien partageable */}
      <div className="bg-jungle-50 rounded-xl border border-jungle-200 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-ink">Lien de collecte d&apos;avis</p>
          <p className="text-xs text-gray-500 mt-0.5">Partagez ce lien avec vos clients pour recueillir leurs avis</p>
        </div>
        <button
          onClick={copyLink}
          className="flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
        >
          {copied ? <><Check size={14} /> Copié !</> : <><Copy size={14} /> Copier le lien</>}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-ink">{reviews.length}</p>
          <p className="text-xs text-gray-400">Total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-sun-600">{pending.length}</p>
          <p className="text-xs text-gray-400">En attente</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-jungle-600">{approved.length}</p>
          <p className="text-xs text-gray-400">Approuvés</p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Aucun avis pour le moment</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* En attente */}
          {pending.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                En attente de validation ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map((r) => (
                  <ReviewCard key={r.id} review={r} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}

          {/* Approuvés */}
          {approved.length > 0 && (
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                Approuvés ({approved.length})
              </h2>
              <div className="space-y-3">
                {approved.map((r) => (
                  <ReviewCard key={r.id} review={r} onAction={handleAction} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, onAction }: { review: Review; onAction: (id: string, action: 'approve' | 'reject' | 'delete') => void }) {
  return (
    <div className={`bg-white rounded-xl border p-5 ${review.is_approved ? 'border-jungle-200' : 'border-sun-200'}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-jungle-100 flex items-center justify-center text-sm font-bold text-jungle-700 shrink-0">
              {review.customer_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{review.customer_name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {review.customer_email && <span>{review.customer_email}</span>}
                {review.order_number && <span>· #{review.order_number}</span>}
              </div>
            </div>
          </div>

          <div className="flex gap-0.5 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span key={s} className={`text-sm ${s <= review.rating ? 'text-sun-400' : 'text-gray-200'}`}>&#9733;</span>
            ))}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
          <p className="text-xs text-gray-400 mt-2">
            {new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 shrink-0">
          {!review.is_approved && (
            <button
              onClick={() => onAction(review.id, 'approve')}
              className="p-1.5 rounded-lg text-jungle-500 hover:bg-jungle-50 transition-colors"
              title="Approuver"
            >
              <CheckCircle size={18} />
            </button>
          )}
          {review.is_approved && (
            <button
              onClick={() => onAction(review.id, 'reject')}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
              title="Retirer"
            >
              <XCircle size={18} />
            </button>
          )}
          <button
            onClick={() => onAction(review.id, 'delete')}
            className="p-1.5 rounded-lg text-gray-300 hover:text-coral-500 hover:bg-coral-50 transition-colors"
            title="Supprimer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
