import { NextRequest } from 'next/server';
import { recoveredMediaPath } from '@/lib/pgbase/media';
import { pgbaseUrl } from '@/lib/pgbase/http';

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const bucket = path[0];
  if (!['product-images', 'demo-videos'].includes(bucket) || path.some(part => !part || part === '.' || part === '..')) return new Response(null, { status: 404 });
  const recovered = recoveredMediaPath(path.join('/'));
  if (recovered) {
    const asset = await fetch(new URL(recovered, request.url), { next: { revalidate: 300 } });
    if (asset.ok) return new Response(asset.body, { headers: { 'Content-Type': asset.headers.get('content-type') || 'image/jpeg', 'Cache-Control': 'public, max-age=300' } });
  }
  try {
    const response = await fetch(pgbaseUrl() + '/storage/objects/' + path.map(encodeURIComponent).join('/'), { signal: AbortSignal.timeout(5000), next: { revalidate: 300 } });
    if (response.ok) return new Response(response.body, { headers: { 'Content-Type': response.headers.get('content-type') || 'application/octet-stream', 'Cache-Control': 'public, max-age=300', 'X-Content-Type-Options': 'nosniff' } });
  } catch { /* Pending originals remain replaceable without changing product data. */ }
  if (bucket === 'demo-videos') return new Response(null, { status: 404 });
  const placeholder = await fetch(new URL('/images/product-unavailable.png', request.url), { next: { revalidate: 300 } });
  return new Response(placeholder.body, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=60' } });
}
