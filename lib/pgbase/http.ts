import 'server-only';

export function pgbaseUrl() {
  const value = process.env.PGBASE_URL?.replace(/\/+$/, '');
  if (!value) throw new Error('PGBASE_URL manquante');
  return value;
}

export async function pgbaseRequest(path: string, options: RequestInit = {}, access: 'secret' | 'public' = 'secret') {
  const key = access === 'secret' ? process.env.PGBASE_SECRET_KEY : process.env.PGBASE_PUBLISHABLE_KEY;
  if (!key) throw new Error(`Clé PGBase ${access} manquante`);
  const headers = new Headers(options.headers);
  headers.set('apikey', key);
  const response = await fetch(pgbaseUrl() + path, { ...options, headers, cache: 'no-store', signal: options.signal || AbortSignal.timeout(20000) });
  if (!response.ok) {
    let message = `PGBase indisponible (${response.status})`;
    try { message = (await response.json()).message || message; } catch { /* keep HTTP status */ }
    throw Object.assign(new Error(message), { status: response.status });
  }
  return response;
}

export async function pgbaseJson(path: string, body: unknown, access: 'secret' | 'public' = 'secret', method = 'POST', token?: string) {
  const response = await pgbaseRequest(path, {
    method,
    headers: { ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  }, access);
  return response.status === 204 ? null : response.json();
}
