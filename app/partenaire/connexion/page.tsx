'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Building2, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function PartnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await createClient().auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
      return;
    }
    router.push(searchParams.get('redirect') || '/partenaire');
    router.refresh();
  };

  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-jungle-700 text-white"><Building2 /></div>
          <h1 className="text-xl font-bold text-ink">Espace partenaire</h1>
          <p className="mt-1 text-sm text-gray-500">Consultez les résultats de votre QR code.</p>
        </div>
        {error && <p className="rounded-lg bg-coral-50 p-3 text-sm text-coral-700">{error}</p>}
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
        <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mot de passe" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm" />
        <button disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-jungle-700 py-3 text-sm font-bold text-white disabled:opacity-50">
          {loading && <Loader2 size={16} className="animate-spin" />} Se connecter
        </button>
        <p className="text-center text-xs text-gray-500">Première connexion ? <Link href="/compte/connexion?redirect=/partenaire" className="font-semibold text-jungle-700 underline">Créer ou activer mon compte</Link></p>
      </form>
    </main>
  );
}

export default function PartnerLoginPage() {
  return <Suspense><PartnerLoginForm /></Suspense>;
}
