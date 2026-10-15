import 'server-only';
import { compileQuery } from './query';
import { pgbaseJson } from './http';
import { rewriteMedia } from './media';

export type QueryIdentity = { role: 'anon' | 'authenticated' | 'service_role'; claims: Record<string, unknown> };

export function createQueryTransport(identity: QueryIdentity): typeof fetch {
  return async (input, init) => {
    try {
      const request = new Request(input, init);
      const url = new URL(request.url);
      if (!url.pathname.includes('/rest/v1/')) throw new Error('Requête inattendue vers PGBase');
      const text = ['GET', 'HEAD'].includes(request.method) ? '' : await request.text();
      const query = compileQuery(url, request.method, request.headers, text ? JSON.parse(text) : undefined);
      const response = await pgbaseJson('/rpc/islanddreams_query', { statement: query.sql, claims: identity.claims, access_role: identity.role });
      let result = response.data;
      if (typeof result === 'string') result = JSON.parse(result);
      if (!result || !Array.isArray(result.rows)) throw new Error('Réponse PGBase invalide');
      const rows = rewriteMedia(result.rows);
      const headers = new Headers({ 'Content-Type': 'application/json' });
      if (query.count) headers.set('Content-Range', `${rows.length ? query.offset : '*'}${rows.length ? '-' + (query.offset + rows.length - 1) : ''}/${result.count}`);
      if (query.head) return new Response(null, { status: 200, headers });
      if (!query.returnRows) return new Response(null, { status: 204, headers });
      if (query.single && rows.length !== 1) return Response.json({ code: 'PGRST116', details: `The result contains ${rows.length} rows`, message: 'Une seule ligne était attendue' }, { status: 406 });
      return new Response(JSON.stringify(query.single ? rows[0] : rows), { status: request.method === 'POST' ? 201 : 200, headers });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur PGBase';
      return Response.json({ code: 'PGBASE_ERROR', message, details: null, hint: null }, { status: 400 });
    }
  };
}
