import { Store, Truck } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { MaintenanceToggle } from './MaintenanceToggle';
import { DemoVideoSettings } from './DemoVideoSettings';
import { ContestSettings } from './ContestSettings';
import { GiftOfferSettings } from './GiftOfferSettings';

async function getMaintenanceSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', ['maintenance_mode', 'maintenance_pin']);

  const map = Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
  return {
    enabled: map['maintenance_mode'] === 'true',
    pin: map['maintenance_pin'] ?? '1234',
  };
}

async function getDemoVideoSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'demo_video_enabled',
      'demo_video_url',
      'demo_video_poster_url',
      'demo_video_product_slug',
      'demo_video_title',
      'demo_video_bubble_position',
    ]);

  return Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
}

async function getContestSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'contest_popup_enabled',
      'contest_popup_prize_source',
      'contest_popup_product_slug',
      'contest_popup_title',
      'contest_popup_description',
      'contest_popup_image_url',
      'contest_popup_prize_url',
      'contest_popup_start_date',
      'contest_popup_end_date',
      'contest_popup_question',
      'contest_popup_require_answer',
      'contest_popup_terms_text',
      'contest_popup_social_text',
      'contest_popup_facebook_url',
      'contest_popup_instagram_url',
      'contest_popup_tiktok_url',
    ]);

  return Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
}

async function getGiftOfferSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'gift_offer_enabled',
      'gift_offer_min_amount',
      'gift_offer_product_slug',
      'gift_offer_title',
      'gift_offer_description',
    ]);

  return Object.fromEntries(
    ((data ?? []) as { key: string; value: string }[]).map((r) => [r.key, r.value])
  );
}

async function getDemoProducts() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('products')
    .select('id, name, slug, status')
    .order('name');

  return (data ?? []) as { id: string; name: string; slug: string; status: string | null }[];
}

export default async function ParametresPage() {
  const [maintenance, demoVideoSettings, contestSettings, giftOfferSettings, demoProducts] = await Promise.all([
    getMaintenanceSettings(),
    getDemoVideoSettings(),
    getContestSettings(),
    getGiftOfferSettings(),
    getDemoProducts(),
  ]);

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Maintenance */}
      <MaintenanceToggle enabled={maintenance.enabled} pin={maintenance.pin} />

      <DemoVideoSettings products={demoProducts} initialSettings={demoVideoSettings} />

      <ContestSettings initialSettings={contestSettings} products={demoProducts} />

      <GiftOfferSettings initialSettings={giftOfferSettings} products={demoProducts} />

      {/* Boutique */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Store size={18} className="text-jungle-600" />
          <h2 className="font-semibold text-ink">Boutique</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la boutique</label>
            <input type="text" defaultValue="Island Dreams"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email de contact</label>
            <input type="email" defaultValue="contact@islanddreams.re"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input type="tel" defaultValue="+262 692 XX XX XX"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <textarea rows={2} defaultValue="XX rue Example, 97400 Saint-Denis, La Réunion"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-none" />
          </div>
        </div>
      </section>

      {/* Livraison */}
      <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <Truck size={18} className="text-ocean-600" />
          <h2 className="font-semibold text-ink">Livraison</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais La Réunion</label>
              <input type="text" defaultValue="4,90 €"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frais Métropole</label>
              <input type="text" defaultValue="8,90 €"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Franco de port à partir de</label>
            <input type="text" defaultValue="49,00 €"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500" />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button className="px-6 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors">
          Enregistrer
        </button>
      </div>
    </div>
  );
}
