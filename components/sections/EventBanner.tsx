import { createAdminClient } from '@/lib/supabase/admin';
import { TrackedEventLink } from './TrackedEventLink';

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

  const href = getBannerHref(banner.cta_link);
  const marqueeItem = (
    <span className="inline-flex items-center gap-3 whitespace-nowrap px-5 md:px-7">
      <span className="text-xs font-black leading-none md:text-sm">{banner.title}</span>
      {banner.subtitle && (
        <span className="hidden text-xs leading-none text-white/80 sm:inline md:text-sm">{banner.subtitle}</span>
      )}
    </span>
  );

  return (
    <div className="fixed inset-x-0 top-0 z-[70] bg-gradient-to-r from-coral-600 via-coral-500 to-sun-400 text-white shadow-md">
      <div className="mx-auto flex h-9 max-w-6xl items-center gap-2 px-3 md:h-10 md:px-4">
        <TrackedEventLink
          href={href}
          eventName="event_banner_ticker_clicked"
          eventProps={{
            banner_id: banner.id,
            banner_title: banner.title,
            cta_text: banner.cta_text,
          }}
          className="group min-w-0 flex-1 overflow-hidden"
          ariaLabel={`${banner.title}${banner.subtitle ? ` — ${banner.subtitle}` : ''}`}
        >
          <span className="event-marquee-track inline-flex items-center">
            {marqueeItem}
            {marqueeItem}
            {marqueeItem}
          </span>
        </TrackedEventLink>
        <TrackedEventLink
          href={href}
          eventName="event_banner_cta_clicked"
          eventProps={{
            banner_id: banner.id,
            banner_title: banner.title,
            cta_text: banner.cta_text,
          }}
          className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-white transition-colors hover:bg-white/30 md:px-4"
        >
          {banner.cta_text}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </TrackedEventLink>
      </div>
    </div>
  );
}
