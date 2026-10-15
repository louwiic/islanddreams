import recoveredMedia from './recovered-media.json';

const original = 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/';
const recovered = recoveredMedia as Record<string, string>;

export function mediaUrl(value: string) {
  if (!value.startsWith(original)) return value;
  const path = decodeURIComponent(value.slice(original.length).split('?')[0]);
  return '/media/supabase/' + path.split('/').map(encodeURIComponent).join('/');
}

export function recoveredMediaPath(path: string) { return recovered[path]; }

export function restoreSourceMedia<T>(value: T): T {
  if (typeof value === 'string') return value.replace(/(?:https:\/\/(?:www\.)?islanddreams\.re)?\/media\/supabase\//g, original) as T;
  if (Array.isArray(value)) return value.map(restoreSourceMedia) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, restoreSourceMedia(child)])) as T;
  return value;
}

/** Also covers images embedded in saved product/blog HTML. Originals stay in
 * PostgreSQL so their URLs can be migrated once Supabase releases the files. */
export function rewriteMedia<T>(value: T): T {
  if (typeof value === 'string') {
    if (value.startsWith(original) && !value.includes('<')) return mediaUrl(value) as T;
    return value.replace(/https:\/\/sgxilglkeupxpnzkzqfq\.supabase\.co\/storage\/v1\/object\/public\/[^\s"'<>]+/g, mediaUrl) as T;
  }
  if (Array.isArray(value)) return value.map(rewriteMedia) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, rewriteMedia(child)])) as T;
  return value;
}
