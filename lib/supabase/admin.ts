import 'server-only';
import { attachStorage, createDataClient } from '@/lib/pgbase/data-client';

/** PGBase service credentials are used only by trusted server operations. */
export function createAdminClient() {
  return attachStorage(createDataClient({ role: 'service_role', claims: { role: 'service_role' } }));
}
