import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

async function action(name: string, input: unknown = {}) {
  try {
    const response = await fetch('/api/auth/' + name, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), cache: 'no-store' });
    return await response.json();
  } catch { return { data: { user: null, session: null }, error: { message: 'Connexion impossible. Réessaie dans quelques instants.' } }; }
}

/** Authentication stays on our origin with HttpOnly cookies. */
export function createClient() {
  return { auth: {
    signInWithPassword: (input: unknown) => action('signin', input),
    signUp: (input: unknown) => action('signup', input),
    signOut: () => action('signout'),
    getUser: () => action('user'),
    resetPasswordForEmail: (email: string) => action('reset', { email }),
    updateUser: (input: { password: string }) => action('update', { ...input, token: new URLSearchParams(window.location.search).get('token') }),
    exchangeCodeForSession: (code: string) => action('exchange', { code }),
  } } as unknown as Pick<SupabaseClient<Database>, 'auth'>;
}
