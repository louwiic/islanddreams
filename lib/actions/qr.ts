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
  partnerEnabled?: boolean;
  partnerName?: string;
  partnerEmail?: string;
  commissionRate?: number;
  attributionDays?: number;
};

export type QrConversion = {
  id: string;
  campaignId: string;
  partnerEmail: string;
  orderId: string;
  stripeSessionId: string;
  orderTotal: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'cancelled' | 'paid';
  createdAt: string;
};

export type QrCampaignStats = {
  total: number;
  lastScannedAt: string | null;
  days: Record<string, number>;
  pageViews?: number;
  paths?: Record<string, number>;
};

const CAMPAIGNS_KEY = 'qr_campaigns';
const STATS_KEY = 'qr_stats';
const CONVERSIONS_KEY = 'qr_conversions';

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

export async function getQrConversions() {
  const value = await getSettingValue(CONVERSIONS_KEY);
  return Array.isArray(value) ? (value as unknown as QrConversion[]) : [];
}

export async function updateQrConversionStatus(id: string, status: QrConversion['status']) {
  if (!['pending', 'approved', 'cancelled', 'paid'].includes(status)) {
    return { error: 'Statut invalide.' };
  }
  const conversions = await getQrConversions();
  await setSettingValue(
    CONVERSIONS_KEY,
    conversions.map((conversion) => conversion.id === id ? { ...conversion, status } : conversion),
  );
  revalidatePath('/admin/qrcodes');
  revalidatePath('/partenaire');
  return { success: true };
}

export async function saveQrCampaign(input: {
  id?: string;
  name: string;
  sourceTag: string;
  destinationUrl: string;
  isActive: boolean;
  partnerEnabled?: boolean;
  partnerName?: string;
  partnerEmail?: string;
  commissionRate?: number;
  attributionDays?: number;
}) {
  const name = input.name.trim();
  const sourceTag = slugify(input.sourceTag || name);
  const destinationUrl = input.destinationUrl.trim();
  const partnerEmail = input.partnerEmail?.trim().toLowerCase() || '';
  const commissionRate = Math.min(100, Math.max(0, Number(input.commissionRate) || 0));
  const attributionDays = Math.min(365, Math.max(1, Math.round(Number(input.attributionDays) || 30)));

  if (!name || !sourceTag || !destinationUrl) {
    return { error: 'Nom, source et URL cible sont obligatoires.' };
  }
  if (input.partnerEnabled && (!partnerEmail || commissionRate <= 0)) {
    return { error: 'Email partenaire et taux de commission sont obligatoires.' };
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
    partnerEnabled: Boolean(input.partnerEnabled),
    partnerName: input.partnerName?.trim() || '',
    partnerEmail,
    commissionRate,
    attributionDays,
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
