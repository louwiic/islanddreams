import 'server-only';
import { pgbaseJson } from './http';

export const ACCESS_COOKIE = 'islanddreams-access';
export const REFRESH_COOKIE = 'islanddreams-refresh';
export type CookieOptions = { httpOnly: boolean; secure: boolean; sameSite: 'lax'; path: string; maxAge: number };
export type CookieJar = { get(name: string): { value: string } | undefined; set(name: string, value: string, options: CookieOptions): void };
export type SiteUser = { id: string; email?: string; user_metadata?: Record<string, unknown>; [key: string]: unknown };

function normalizeUser(value: SiteUser | null | undefined): SiteUser | null {
  if (!value?.id) return null;
  return { ...value, user_metadata: value.user_metadata || { name: value.name, avatar_url: value.avatar } };
}

export function createServerAuth(jar: CookieJar) {
  const options: CookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 30 * 24 * 3600 };
  function clear() {
    jar.set(ACCESS_COOKIE, '', { ...options, maxAge: 0 });
    jar.set(REFRESH_COOKIE, '', { ...options, maxAge: 0 });
  }
  function save(session: { accessToken: string; refreshToken: string }) {
    jar.set(ACCESS_COOKIE, session.accessToken, options);
    jar.set(REFRESH_COOKIE, session.refreshToken, options);
  }
  let userPromise: Promise<{ data: { user: SiteUser | null }; error: Error | null }> | undefined;
  async function getUser() {
    if (!userPromise) userPromise = (async () => {
      const token = jar.get(ACCESS_COOKIE)?.value;
      if (!token) return { data: { user: null }, error: null };
      try {
        const result = await pgbaseJson('/auth/user', undefined, 'public', 'GET', token);
        return { data: { user: normalizeUser(result.user) }, error: null };
      } catch (error) { return { data: { user: null }, error: error as Error }; }
    })();
    return userPromise;
  }
  async function authenticate(path: string, input: unknown) {
    const result = await pgbaseJson(path, input, 'public');
    if (result.session) save(result.session);
    return { data: { user: normalizeUser(result.user), session: result.session ? { user: normalizeUser(result.user) } : null }, error: null };
  }
  return {
    getUser,
    async refresh() {
      const current = await getUser();
      if (current.data.user) return { data: { ...current.data, session: { user: current.data.user } }, error: null };
      const refreshToken = jar.get(REFRESH_COOKIE)?.value;
      if (!refreshToken) throw Object.assign(new Error('Session expirée'), { status: 401 });
      try { return await authenticate('/auth/refresh', { refreshToken }); }
      catch (error) { if ((error as { status?: number }).status === 401) clear(); throw error; }
    },
    signInWithPassword: (input: { email: string; password: string }) => authenticate('/auth/signin', input),
    signUp: (input: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => authenticate('/auth/signup', { email: input.email, password: input.password, data: input.options?.data || {} }),
    exchangeCodeForSession: (code: string) => authenticate('/auth/oauth/exchange', { code }),
    async signOut() {
      const refreshToken = jar.get(REFRESH_COOKIE)?.value;
      try { if (refreshToken) await pgbaseJson('/auth/signout', { refreshToken, scope: 'local' }, 'public', 'POST', jar.get(ACCESS_COOKIE)?.value); }
      finally { clear(); }
      return { error: null };
    },
    async resetPasswordForEmail(email: string) {
      await pgbaseJson('/collections/users/request-password-reset', { email }, 'public');
      return { data: {}, error: null };
    },
    async updateUser(input: { password: string; token?: string }) {
      if (!input.token) throw new Error('Le lien de réinitialisation est invalide ou expiré.');
      await pgbaseJson('/collections/users/confirm-password-reset', { token: input.token, password: input.password }, 'public');
      clear();
      return { data: { user: null }, error: null };
    },
    async verify(token: string) {
      await pgbaseJson('/collections/users/confirm-verification', { token }, 'public');
      return { data: {}, error: null };
    },
  };
}
