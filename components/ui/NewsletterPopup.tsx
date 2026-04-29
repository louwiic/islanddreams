'use client';

import { useEffect, useState } from 'react';
import { X, Gift, Mail, Copy, Check } from 'lucide-react';

const STORAGE_KEY = 'id-newsletter-dismissed';

export function NewsletterPopup() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [code, setCode]         = useState<string | null>(null);
  const [copied, setCopied]     = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    // Ne pas réafficher si déjà vu
    if (sessionStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setVisible(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setCode(data.code);
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 sm:p-6">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-ink/50 backdrop-blur-sm"
        onClick={dismiss}
      />

      {/* Modale */}
      <div className="relative z-10 w-full max-w-md bg-cream rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

        {/* Bandeau top */}
        <div className="bg-jungle-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift size={18} className="text-sun-300" />
            <span className="text-cream font-bold text-sm uppercase tracking-wider">
              Cadeau péi
            </span>
          </div>
          <button onClick={dismiss} className="text-cream/60 hover:text-cream transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-7">
          {!code ? (
            <>
              <h3 className="title-chunky-light text-2xl text-ink mb-1">
                -10% sur ta commande
              </h3>
              <p className="text-ink/55 text-sm mb-6 leading-relaxed">
                Inscris-toi à la newsletter Island Dreams et reçois un code de réduction immédiatement.
                Promotions, nouveautés péi, on te tient au courant.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 bg-white border-2 border-ink/15 rounded-xl px-4 py-3 focus-within:border-jungle-600 transition-colors">
                  <Mail size={16} className="text-ink/30 shrink-0" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ton@email.com"
                    required
                    className="flex-1 bg-transparent text-ink text-sm outline-none placeholder:text-ink/30"
                  />
                </div>
                {error && <p className="text-red-500 text-xs">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream font-bold text-sm uppercase tracking-wider rounded-xl transition-colors disabled:opacity-50"
                >
                  {loading ? 'Un instant…' : 'Recevoir mon code'}
                </button>
              </form>
              <p className="text-ink/35 text-[10px] text-center mt-3">
                Pas de spam. Désinscription en un clic.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="text-4xl mb-3">🎉</div>
              <h3 className="title-chunky-light text-2xl text-ink mb-1">
                Voilà ton code !
              </h3>
              <p className="text-ink/55 text-sm mb-5">
                Utilise-le à la validation de ta commande.
              </p>
              <button
                onClick={copyCode}
                className="inline-flex items-center gap-3 px-6 py-3.5 bg-sun-400 hover:bg-sun-300 rounded-2xl transition-colors group w-full justify-center"
              >
                <span className="font-black text-ink text-xl tracking-widest">{code}</span>
                {copied
                  ? <Check size={18} className="text-ink" />
                  : <Copy size={16} className="text-ink/50 group-hover:text-ink transition-colors" />
                }
              </button>
              <p className="text-ink/40 text-xs mt-3">
                {copied ? 'Copié !' : 'Clique pour copier'}
              </p>
              <button
                onClick={dismiss}
                className="mt-5 text-ink/40 hover:text-ink text-xs underline transition-colors"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
