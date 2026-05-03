import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
};

async function getActiveBanner(): Promise<Banner | null> {
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

export async function EventBanner() {
  const banner = await getActiveBanner();
  if (!banner) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-coral-600 via-coral-500 to-sun-400 text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 md:py-4">
        <Link
          href={banner.cta_link}
          className="flex items-center justify-center gap-4 md:gap-6 group"
        >
          {/* Image produit */}
          {banner.image_url && (
            <div className="relative w-12 h-12 md:w-16 md:h-16 flex-shrink-0 rounded-xl overflow-hidden bg-white/20 shadow-lg">
              <Image
                src={banner.image_url}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Texte */}
          <div className="text-center md:text-left">
            <p className="font-bold text-sm md:text-base leading-tight">
              {banner.title}
            </p>
            {banner.subtitle && (
              <p className="text-white/80 text-xs md:text-sm leading-tight mt-0.5">
                {banner.subtitle}
              </p>
            )}
          </div>

          {/* CTA */}
          <span className="hidden md:inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold uppercase tracking-wider rounded-full transition-colors flex-shrink-0 group-hover:bg-white/30">
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
