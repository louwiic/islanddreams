'use client';

import { useState } from 'react';
import { Send, Loader2, CheckCircle } from 'lucide-react';

export function ReviewForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || rating === 0) return;
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/avis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: name.trim(),
          customer_email: email.trim() || undefined,
          order_number: orderNumber.trim() || undefined,
          rating,
          comment: comment.trim(),
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de l\'envoi');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center shadow-sm">
        <CheckCircle size={40} className="text-jungle-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-ink mb-2">Merci pour votre avis !</h3>
        <p className="text-sm text-gray-500">
          Votre avis sera publié après validation par notre équipe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-ink uppercase tracking-wider mb-2">Laisser un avis</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Votre nom <span className="text-coral-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jean D."
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email (optionnel)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">N° de commande (optionnel)</label>
        <input
          type="text"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="Ex: ID-2026-0001"
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
        />
      </div>

      {/* Étoiles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Note <span className="text-coral-500">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-2xl transition-colors"
            >
              <span className={s <= (hoverRating || rating) ? 'text-sun-400' : 'text-gray-200'}>
                &#9733;
              </span>
            </button>
          ))}
          {rating > 0 && (
            <span className="text-xs text-gray-400 self-center ml-2">
              {rating}/5
            </span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Votre avis <span className="text-coral-500">*</span>
        </label>
        <textarea
          required
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Partagez votre expérience avec Island Dreams..."
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
        />
      </div>

      {error && <p className="text-sm text-coral-500">{error}</p>}

      <button
        type="submit"
        disabled={sending || !name.trim() || !comment.trim() || rating === 0}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-bold rounded-lg transition-colors disabled:opacity-50"
      >
        {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Envoyer mon avis
      </button>
    </form>
  );
}
