import { cookies } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { createDataClient } from '@/lib/pgbase/data-client';
import { createServerAuth } from '@/lib/pgbase/auth';

export async function createClient() {
  const auth = createServerAuth(await cookies());
  const { data: { user } } = await auth.getUser();
  const role = user ? 'authenticated' : 'anon';
  const client = createDataClient({ role, claims: { role, ...(user ? { sub: user.id, email: user.email } : {}) } });
  Object.assign(client.auth, auth);
  return client as unknown as SupabaseClient<Database>;
}
