'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { getAdminEmails, requireAdmin } from '@/lib/auth/admin';
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

async function getQrAccess() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email?.toLowerCase();
  if (!email) throw new Error('Authentification requise.');
  return { email, isAdmin: getAdminEmails().has(email) };
}

export async function getQrCampaigns() {
  const access = await getQrAccess();
  const campaigns = asArray(await getSettingValue(CAMPAIGNS_KEY));
  return access.isAdmin
    ? campaigns
    : campaigns.filter((campaign) => campaign.partnerEnabled && campaign.partnerEmail?.toLowerCase() === access.email);
}

export async function getQrStats() {
  const access = await getQrAccess();
  const allCampaigns = asArray(await getSettingValue(CAMPAIGNS_KEY));
  const allowedCampaignIds = new Set(
    (access.isAdmin
      ? allCampaigns
      : allCampaigns.filter((campaign) => campaign.partnerEnabled && campaign.partnerEmail?.toLowerCase() === access.email))
      .map((campaign) => campaign.id),
  );
  const legacy = asStats(await getSettingValue(STATS_KEY));
  const db = createAdminClient() as any;
  const { data: events, error } = await db
    .from('qr_events')
    .select('campaign_id,event_type,path,created_at')
    .order('created_at', { ascending: true });
  if (error || !Array.isArray(events)) {
    return Object.fromEntries(Object.entries(legacy).filter(([campaignId]) => allowedCampaignIds.has(campaignId)));
  }

  const stats = structuredClone(legacy);
  for (const event of events) {
    const campaignId = String(event.campaign_id || '');
    if (!campaignId) continue;
    const current = stats[campaignId] ?? { total: 0, lastScannedAt: null, days: {} };
    const createdAt = String(event.created_at || new Date().toISOString());
    if (event.event_type === 'scan') {
      const day = createdAt.slice(0, 10);
      current.total += 1;
      current.lastScannedAt = createdAt;
      current.days = { ...current.days, [day]: (current.days?.[day] ?? 0) + 1 };
    } else if (event.event_type === 'page_view') {
      const path = String(event.path || '/');
      current.pageViews = (current.pageViews ?? 0) + 1;
      current.paths = { ...current.paths, [path]: (current.paths?.[path] ?? 0) + 1 };
    }
    stats[campaignId] = current;
  }
  return Object.fromEntries(Object.entries(stats).filter(([campaignId]) => allowedCampaignIds.has(campaignId)));
}

export async function getQrConversions() {
  const access = await getQrAccess();
  const allCampaigns = asArray(await getSettingValue(CAMPAIGNS_KEY));
  const allowedCampaignIds = new Set(
    (access.isAdmin
      ? allCampaigns
      : allCampaigns.filter((campaign) => campaign.partnerEnabled && campaign.partnerEmail?.toLowerCase() === access.email))
      .map((campaign) => campaign.id),
  );
  const value = await getSettingValue(CONVERSIONS_KEY);
  const legacy = (Array.isArray(value) ? (value as unknown as QrConversion[]) : [])
    .filter((conversion) => allowedCampaignIds.has(conversion.campaignId));
  const db = createAdminClient() as any;
  const { data: rows, error } = await db
    .from('qr_partner_conversions')
    .select('*')
    .order('created_at', { ascending: false });
  if (error || !Array.isArray(rows)) return legacy;

  const tableRows: QrConversion[] = rows.filter((row: any) => allowedCampaignIds.has(row.campaign_id)).map((row: any) => ({
    id: row.id,
    campaignId: row.campaign_id,
    partnerEmail: row.partner_email,
    orderId: row.order_id,
    stripeSessionId: row.stripe_session_id,
    orderTotal: Number(row.order_total),
    commissionRate: Number(row.commission_rate),
    commissionAmount: Number(row.commission_amount),
    status: row.status,
    createdAt: row.created_at,
  }));
  const byStripeSession = new Map(legacy.map((conversion) => [conversion.stripeSessionId, conversion]));
  for (const conversion of tableRows) byStripeSession.set(conversion.stripeSessionId, conversion);
  return [...byStripeSession.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateQrConversionStatus(id: string, status: QrConversion['status']) {
  await requireAdmin();
  if (!['pending', 'approved', 'cancelled', 'paid'].includes(status)) {
    return { error: 'Statut invalide.' };
  }
  const conversions = await getQrConversions();
  const db = createAdminClient() as any;
  await db
    .from('qr_partner_conversions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
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
  await requireAdmin();
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
  await requireAdmin();
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
