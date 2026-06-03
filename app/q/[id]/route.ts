import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QrCampaign, QrCampaignStats } from '@/lib/actions/qr';

type PageProps = {
  params: Promise<{ id: string }>;
};

function asCampaigns(value: unknown): QrCampaign[] {
  return Array.isArray(value) ? (value as QrCampaign[]) : [];
}

function asStats(value: unknown): Record<string, QrCampaignStats> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as Record<string, QrCampaignStats>;
}

function addTrackingParams(destinationUrl: string, requestUrl: string, campaign: QrCampaign) {
  const url = new URL(destinationUrl, requestUrl);
  url.searchParams.set('utm_source', campaign.sourceTag);
  url.searchParams.set('utm_medium', 'qr_code');
  url.searchParams.set('utm_campaign', campaign.id);
  return url;
}

export async function GET(req: NextRequest, { params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: campaignsRow } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', 'qr_campaigns')
    .maybeSingle();

  const campaign = asCampaigns(campaignsRow?.value).find((item) => item.id === id);
  if (!campaign || !campaign.isActive) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  const now = new Date();
  const day = now.toISOString().slice(0, 10);
  const { data: statsRow } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', 'qr_stats')
    .maybeSingle();

  const stats = asStats(statsRow?.value);
  const current = stats[id] ?? { total: 0, lastScannedAt: null, days: {} };
  const nextStats = {
    ...stats,
    [id]: {
      total: current.total + 1,
      lastScannedAt: now.toISOString(),
      days: {
        ...current.days,
        [day]: (current.days?.[day] ?? 0) + 1,
      },
    },
  };

  await supabase
    .from('shop_settings')
    .upsert({ key: 'qr_stats', value: nextStats }, { onConflict: 'key' });

  return NextResponse.redirect(addTrackingParams(campaign.destinationUrl, req.url, campaign));
}
