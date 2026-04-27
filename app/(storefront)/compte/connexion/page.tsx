'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup';

export default function ConnexionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirect = searchParams.get('redirect') ?? '/compte';
  const hasError = searchParams.get('error') === 'auth';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(hasError ? 'Lien invalide ou expiré.' : null);
  const [success, setSuccess] = useState<string | null>(null);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setError(
            error.message.includes('Invalid login credentials')
              ? 'Email ou mot de passe incorrect.'
              : error.message
          );
        } else {
          router.push(redirect);
          router.refresh();
        }
      } else {
        // Inscription
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
          },
        });
        if (error) {
          setError(error.message);
        } else {
          setSuccess(
            'Un email de confirmation vous a été envoyé. Cliquez sur le lien pour activer votre compte.'
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-8" />
      <div className="px-4 pt-10 pb-16 max-w-sm mx-auto">

        {/* Tabs */}
        <div className="flex rounded-xl border border-ink/10 overflow-hidden mb-8 bg-white">
          {(['login', 'signup'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setSuccess(null); }}
              className={`flex-1 py-3 text-sm font-bold transition-colors flex items-center justify-center gap-2 ${
                mode === m
                  ? 'bg-jungle-700 text-cream'
                  : 'text-ink/60 hover:text-ink'
              }`}
            >
              {m === 'login' ? <><LogIn size={15} /> Se connecter</> : <><UserPlus size={15} /> Créer un compte</>}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              className="w-full px-4 py-3 rounded-xl border border-ink/15 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-xl border border-ink/15 bg-white text-ink text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink/60 transition-colors"
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}
          {success && (
            <p className="text-sm text-jungle-700 bg-jungle-50 rounded-xl px-4 py-3">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : mode === 'login' ? (
              'Se connecter'
            ) : (
              'Créer mon compte'
            )}
          </button>
        </form>

        {mode === 'login' && (
          <p className="mt-4 text-center text-sm text-ink/40">
            Mot de passe oublié ?{' '}
            <Link href="/compte/mot-de-passe-oublie" className="underline hover:text-ink transition-colors">
              Réinitialiser
            </Link>
          </p>
        )}

        <p className="mt-6 text-center text-xs text-ink/30">
          Pas encore de commande ?{' '}
          <Link href="/boutique" className="underline hover:text-ink/60 transition-colors">
            Découvrir la boutique
          </Link>
        </p>
      </div>
    </main>
  );
}
