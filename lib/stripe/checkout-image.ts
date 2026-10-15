import { mediaUrl } from '@/lib/pgbase/media';

/** Stripe requires absolute image URLs, including for carts saved before the migration. */
export function checkoutImageUrl(image: string | undefined, siteUrl: string): string | undefined {
  if (!image) return undefined;
  try {
    const url = new URL(mediaUrl(image), siteUrl);
    return ['https:', 'http:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}
