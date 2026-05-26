import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

export type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
};

export async function getActiveBanner(): Promise<Banner | null> {
  const supabase = createAdminClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from('hero_banners' as never)
    .select('id, title, subtitle, image_url, cta_text, cta_link')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('priority', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  return data[0] as unknown as Banner;
}

function getBannerHref(link: string) {
  if (link.startsWith('#evenement-special')) return '#evenement-special';
  return link;
}

export function EventBanner({ banner }: { banner: Banner | null }) {
  if (!banner) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[70] bg-gradient-to-r from-coral-600 via-coral-500 to-sun-400 text-white shadow-md">
      <div className="mx-auto max-w-6xl px-3 py-1.5 md:px-4 md:py-2">
        <Link
          href={getBannerHref(banner.cta_link)}
          className="group flex min-h-8 items-center justify-center gap-3 md:min-h-9 md:gap-4"
        >
          {banner.image_url && (
            <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-lg bg-white/20 shadow md:h-9 md:w-9">
              <Image
                src={banner.image_url}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="min-w-0 text-center md:text-left">
            <p className="truncate text-sm font-black leading-tight md:text-base">
              {banner.title}
            </p>
            {banner.subtitle && (
              <p className="hidden text-xs leading-tight text-white/80 sm:block">
                {banner.subtitle}
              </p>
            )}
          </div>

          <span className="hidden flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors group-hover:bg-white/30 md:inline-flex">
            {banner.cta_text}
            <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </Link>
      </div>
    </div>
  );
}
