import 'server-only';
import { createClient as createTypedClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { pgbaseUrl } from './http';
import { createQueryTransport, type QueryIdentity } from './transport';
import { createStorage } from './storage';

/** Keep the application's generated table types and query syntax while every
 * actual data operation executes against the isolated PGBase PostgreSQL DB. */
export function createDataClient(identity: QueryIdentity) {
  return createTypedClient<Database>(pgbaseUrl(), 'pgbase-server-adapter', {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { fetch: createQueryTransport(identity) },
  });
}

export function attachStorage(client: SupabaseClient<Database>) {
  return Object.assign(client, { storage: createStorage() }) as unknown as SupabaseClient<Database>;
}
