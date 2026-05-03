import { createAdminClient } from '@/lib/supabase/admin';
import Link from 'next/link';
import { Plus, Calendar, Eye, EyeOff } from 'lucide-react';
import { DeleteBannerButton, ToggleBannerButton } from './BannerActions';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  cta_text: string;
  cta_link: string;
  start_date: string;
  end_date: string;
  priority: number;
  is_active: boolean;
  created_at: string;
};

async function getBanners() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('hero_banners' as never)
    .select('*')
    .order('start_date', { ascending: false });
  return (data ?? []) as unknown as Banner[];
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

function isCurrentlyActive(b: Banner) {
  if (!b.is_active) return false;
  const today = new Date().toISOString().slice(0, 10);
  return b.start_date <= today && b.end_date >= today;
}

export default async function BannersPage() {
  const banners = await getBanners();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-ink">Bannières événements</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les bannières promotionnelles affichées sur la page d&apos;accueil
          </p>
        </div>
        <Link
          href="/admin/banners/nouveau"
          className="inline-flex items-center gap-2 px-4 py-2 bg-jungle-600 hover:bg-jungle-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouvelle bannière
        </Link>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Aucune bannière créée</p>
          <p className="text-gray-400 text-sm mt-1">Créez votre première bannière événementielle</p>
        </div>
      ) : (
        <div className="space-y-3">
          {banners.map((banner) => {
            const active = isCurrentlyActive(banner);
            return (
              <div
                key={banner.id}
                className={`bg-white rounded-xl border p-4 md:p-5 flex items-center gap-4 ${
                  active ? 'border-coral-300 ring-1 ring-coral-200' : 'border-gray-200'
                }`}
              >
                {/* Image */}
                {banner.image_url ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Calendar size={20} className="text-gray-300" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-ink truncate">{banner.title}</h3>
                    {active && (
                      <span className="px-2 py-0.5 bg-coral-100 text-coral-600 text-[10px] font-bold uppercase rounded-full">
                        En ligne
                      </span>
                    )}
                    {!banner.is_active && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-400 text-[10px] font-bold uppercase rounded-full">
                        Désactivé
                      </span>
                    )}
                  </div>
                  {banner.subtitle && (
                    <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(banner.start_date)} → {formatDate(banner.end_date)} · Priorité {banner.priority}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ToggleBannerButton id={banner.id} isActive={banner.is_active} />
                  <Link
                    href={`/admin/banners/${banner.id}`}
                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-ink bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Modifier
                  </Link>
                  <DeleteBannerButton id={banner.id} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
