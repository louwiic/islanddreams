'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/lib/supabase/types';

export type QrCampaign = {
  id: string;
  name: string;
  sourceTag: string;
  destinationUrl: string;
  isActive: boolean;
  createdAt: string;
};

export type QrCampaignStats = {
  total: number;
  lastScannedAt: string | null;
  days: Record<string, number>;
};

const CAMPAIGNS_KEY = 'qr_campaigns';
const STATS_KEY = 'qr_stats';

function asArray(value: unknown): QrCampaign[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is QrCampaign => {
    if (!item || typeof item !== 'object') return false;
    const row = item as Partial<QrCampaign>;
    return Boolean(row.id && row.name && row.sourceTag && row.destinationUrl);
  });
}

function asStats(value: unknown): Record<string, QrCampaignStats> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, QrCampaignStats>;
}

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

async function getSettingValue(key: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  return data?.value ?? null;
}

async function setSettingValue(key: string, value: unknown) {
  const supabase = createAdminClient();
  await supabase
    .from('shop_settings')
    .upsert({ key, value: value as Json }, { onConflict: 'key' });
}

export async function getQrCampaigns() {
  return asArray(await getSettingValue(CAMPAIGNS_KEY));
}

export async function getQrStats() {
  return asStats(await getSettingValue(STATS_KEY));
}

export async function saveQrCampaign(input: {
  id?: string;
  name: string;
  sourceTag: string;
  destinationUrl: string;
  isActive: boolean;
}) {
  const name = input.name.trim();
  const sourceTag = slugify(input.sourceTag || name);
  const destinationUrl = input.destinationUrl.trim();

  if (!name || !sourceTag || !destinationUrl) {
    return { error: 'Nom, source et URL cible sont obligatoires.' };
  }

  const campaigns = await getQrCampaigns();
  const id = input.id || `${sourceTag}-${Date.now().toString(36)}`;
  const existing = campaigns.find((campaign) => campaign.id === id);
  const nextCampaign: QrCampaign = {
    id,
    name,
    sourceTag,
    destinationUrl,
    isActive: input.isActive,
    createdAt: existing?.createdAt || new Date().toISOString(),
  };

  const next = existing
    ? campaigns.map((campaign) => (campaign.id === id ? nextCampaign : campaign))
    : [nextCampaign, ...campaigns];

  await setSettingValue(CAMPAIGNS_KEY, next);
  revalidatePath('/admin/qrcodes');
  return { campaign: nextCampaign };
}

export async function deleteQrCampaign(id: string) {
  const [campaigns, stats] = await Promise.all([getQrCampaigns(), getQrStats()]);
  await setSettingValue(
    CAMPAIGNS_KEY,
    campaigns.filter((campaign) => campaign.id !== id)
  );
  const nextStats = { ...stats };
  delete nextStats[id];
  await setSettingValue(STATS_KEY, nextStats);
  revalidatePath('/admin/qrcodes');
  return { success: true };
}
