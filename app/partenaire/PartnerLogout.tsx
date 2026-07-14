'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function PartnerLogout() {
  const router = useRouter();
  return <button onClick={async () => { await createClient().auth.signOut(); router.push('/partenaire/connexion'); router.refresh(); }} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600"><LogOut size={15} />Déconnexion</button>;
}
