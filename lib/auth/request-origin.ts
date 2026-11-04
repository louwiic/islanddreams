type OriginRequest = { url: string; headers: Pick<Headers, 'get'> };

/** Public origins come from server configuration, never client-supplied proxy headers. */
export function isAllowedAuthOrigin(request: OriginRequest, env = process.env) {
  const origin = request.headers.get('origin');
  if (origin === null) return true; // Preserve server-to-server requests without Origin.

  const production = env.NODE_ENV === 'production';
  const allowed = new Set<string>();
  if (production) {
    allowed.add('https://islanddreams.re');
    allowed.add('https://www.islanddreams.re');
  } else {
    allowed.add(new URL(request.url).origin);
  }

  if (env.NEXT_PUBLIC_SITE_URL) {
    try {
      const site = new URL(env.NEXT_PUBLIC_SITE_URL);
      if (!site.username && !site.password && (site.protocol === 'https:' || (!production && site.protocol === 'http:'))) {
        allowed.add(site.origin);
      }
    } catch { /* Invalid optional configuration must not broaden access. */ }
  }

  // Vercel sets these deployment hostnames on the server, including for previews.
  if (env.VERCEL === '1') {
    for (const host of [env.VERCEL_URL, env.VERCEL_BRANCH_URL]) {
      if (host && /^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/i.test(host)) allowed.add(`https://${host}`);
    }
  }
  return allowed.has(origin);
}
