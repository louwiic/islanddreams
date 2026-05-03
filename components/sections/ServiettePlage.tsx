import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { TextileMobileCarousel } from './TextileMobileCarousel';

type TextileItem = {
  id: string;
  product_name: string;
  image_url: string;
  product_link: string;
};

const FALLBACK: TextileItem[] = [
  { id: '1', product_name: 'Serviette Plage', image_url: '/images/sections/textile-1.png', product_link: '/boutique' },
  { id: '2', product_name: 'Tapis de Plage', image_url: '/images/sections/textile-2.png', product_link: '/boutique' },
  { id: '3', product_name: 'Pareo Péi', image_url: '/images/sections/textile-3.png', product_link: '/boutique' },
];

async function getTextileItems(): Promise<TextileItem[]> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('textile_highlights' as never)
      .select('id, product_name, image_url, product_link')
      .eq('is_active', true)
      .order('position', { ascending: true });

    if (data && data.length > 0) return data as unknown as TextileItem[];
  } catch {
    // table pas encore créée → fallback
  }
  return FALLBACK;
}

export async function ServiettePlage() {
  const items = await getTextileItems();

  return (
    <section
      id="serviette-section"
      className="relative w-full overflow-hidden flex flex-col items-center justify-start"
      style={{ minHeight: '100vh' }}
    >
      {/* BG plage */}
      <Image src="/images/sections/plage-sunset.png" alt="" fill className="object-cover object-bottom" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 pt-12 md:pt-20 pb-10 w-full max-w-5xl mx-auto">

        {/* Titre */}
        <div className="text-center">
          <h2 className="title-chunky-light text-4xl md:text-6xl lg:text-7xl">
            Allon bat un karé la mer
          </h2>
          <p className="mt-2 text-cream/90 text-base md:text-lg italic font-light drop-shadow">
            Découvrir nos articles textiles
          </p>
        </div>

        {/* Flash magique */}
        <div
          id="serviette-flash"
          className="absolute pointer-events-none opacity-0"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,30,0.95) 0%, rgba(255,140,0,0.5) 40%, transparent 70%)',
            width: 320, height: 320,
            top: '45%', left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 20,
          }}
          aria-hidden
        />

        {/* ── Zone centrale ── */}
        <div className="relative flex items-center justify-center w-full" style={{ minHeight: '55vh' }}>

          {/* Femme + serviette */}
          <div
            id="serviette-reveal"
            className="relative w-[280px] md:w-[500px] lg:w-[600px] opacity-0 z-10"
          >
            <Image
              src="/images/products/textile/serviette-plage.png"
              alt="Tapis de plage Island Dreams"
              width={1024} height={1024}
              className="w-full h-auto drop-shadow-2xl"
              unoptimized
            />
          </div>

          {/* Bulle */}
          <div
            id="serviette-bubble"
            className="absolute opacity-0 pointer-events-none z-20"
            style={{ left: '56%', top: '8%' }}
            aria-hidden
          >
            <div className="relative bg-white rounded-2xl px-4 py-3 md:px-6 md:py-4 shadow-xl border-2 border-ink max-w-[160px] md:max-w-[220px]">
              <p id="bubble-msg-1" className="text-ink font-bold text-[12px] md:text-sm leading-snug text-center">
                Attend, on a quelque chose pour toi&nbsp;!
              </p>
              <p id="bubble-msg-2" className="absolute inset-0 flex items-center justify-center text-ink font-bold text-[12px] md:text-sm leading-snug text-center opacity-0 px-4">
                Découvre nos articles pour aller à la playa&nbsp;!
              </p>
              <div
                className="absolute top-1/2 -left-3 w-5 h-5 bg-white border-b-2 border-l-2 border-ink"
                style={{ transform: 'translateY(-50%) rotate(45deg)' }}
              />
            </div>
          </div>

          {/* ── Desktop : cards dynamiques ── */}
          <div className="hidden md:flex absolute inset-0 items-center justify-center gap-5 px-2">
            {items.slice(0, 3).map((item, i) => (
              <div
                key={item.id}
                id={`textile-card-${i + 1}`}
                className="opacity-0 flex-1 max-w-[240px] lg:max-w-[280px] flex flex-col items-center gap-3"
              >
                <div className="rounded-2xl overflow-hidden shadow-xl w-full">
                  <Image
                    src={item.image_url}
                    alt={item.product_name}
                    width={800} height={800}
                    className="w-full h-auto"
                  />
                </div>
                <Link
                  href={item.product_link}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-sun-400 hover:bg-sun-300 text-ink text-xs font-bold uppercase tracking-wider rounded-full shadow transition-colors"
                >
                  Découvrir
                </Link>
              </div>
            ))}
          </div>

          {/* ── Mobile : carousel dynamique ── */}
          <div
            id="textile-carousel-mobile"
            className="md:hidden absolute inset-0 flex items-center justify-center opacity-0 px-2"
          >
            <div className="w-full">
              <TextileMobileCarousel items={items} />
            </div>
          </div>

        </div>

        {/* ── Bouton Découvrir ── */}
        <div id="textile-cta" className="opacity-0 mt-2">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 px-7 py-3 bg-sun-400 hover:bg-sun-300 text-ink font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transition-colors"
          >
            Découvrir la collection
          </Link>
        </div>

      </div>
    </section>
  );
}
