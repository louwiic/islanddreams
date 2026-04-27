'use client';

import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/compte/nouveau-mot-de-passe`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-10 pb-16 max-w-sm mx-auto">
        <Link
          href="/compte/connexion"
          className="flex items-center gap-2 text-sm text-ink/50 hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour à la connexion
        </Link>

        <h1 className="text-xl font-bold text-ink mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-ink/50 mb-6">
          Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        {sent ? (
          <div className="bg-jungle-50 rounded-xl px-5 py-4">
            <p className="text-sm text-jungle-700 font-medium">Email envoyé !</p>
            <p className="text-sm text-jungle-600 mt-1">
              Vérifiez votre boîte mail et cliquez sur le lien.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
