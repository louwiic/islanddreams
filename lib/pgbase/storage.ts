import 'server-only';
import { pgbaseJson, pgbaseRequest, pgbaseUrl } from './http';

type BucketOptions = { public?: boolean; fileSizeLimit?: number | null; allowedMimeTypes?: string[] };
type ListOptions = { limit?: number; offset?: number; search?: string; sortBy?: { column: string; order?: string } };
type UploadOptions = { contentType?: string; cacheControl?: string; upsert?: boolean };

async function result<T>(operation: () => Promise<T>) {
  try { return { data: await operation(), error: null }; }
  catch (error) { return { data: null, error: { message: error instanceof Error ? error.message : 'Erreur de stockage PGBase' } }; }
}

export function createStorage() {
  return {
    listBuckets: () => result(async () => (await pgbaseJson('/storage/buckets', undefined, 'secret', 'GET')).items),
    createBucket: (name: string, options: BucketOptions) => result(() => pgbaseJson('/storage/buckets', { name, ...options })),
    updateBucket: (name: string, options: BucketOptions) => result(() => pgbaseJson('/storage/buckets/' + encodeURIComponent(name), options, 'secret', 'PATCH')),
    from(bucket: string) {
      const base = '/storage/buckets/' + encodeURIComponent(bucket);
      const objectPath = (path: string) => '/storage/objects/' + encodeURIComponent(bucket) + '/' + path.split('/').map(encodeURIComponent).join('/');
      return {
        getPublicUrl: (path: string) => ({ data: { publicUrl: pgbaseUrl() + objectPath(path) } }),
        upload: (path: string, body: BodyInit, options: UploadOptions = {}) => result(async () => {
          const response = await pgbaseRequest(objectPath(path), { method: 'POST', headers: { 'Content-Type': options.contentType || 'application/octet-stream', 'X-Upsert': String(options.upsert || false), 'Cache-Control': options.cacheControl || '3600' }, body });
          const object = await response.json();
          return { path: object.name, fullPath: `${bucket}/${object.name}` };
        }),
        list: (prefix = '', options: ListOptions = {}) => result(async () => {
          const sort = { created_at: 'created', updated_at: 'updated', name: 'name' }[options.sortBy?.column || 'created_at'] || 'created';
          const query = new URLSearchParams({ prefix, limit: String(options.limit || 250), offset: String(options.offset || 0), sortBy: sort, order: options.sortBy?.order || 'desc', search: options.search || '' });
          return (await pgbaseJson(base + '/objects?' + query, undefined, 'secret', 'GET')).items;
        }),
        remove: (paths: string[]) => result(() => pgbaseJson(base + '/objects', { paths }, 'secret', 'DELETE')),
        createSignedUploadUrl: (path: string, options: { upsert?: boolean } = {}) => result(async () => {
          const data = await pgbaseJson(base + '/signed-upload-url', { path, upsert: options.upsert || false, expiresIn: 7200 });
          return { ...data, signedUrl: new URL(data.signedUrl, pgbaseUrl()).href };
        }),
      };
    },
  };
}
