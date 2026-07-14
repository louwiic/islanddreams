import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { QrCampaign, QrCampaignStats } from '@/lib/actions/qr';

export async function POST(request: NextRequest) {
  const campaignId = request.cookies.get('islanddreams_qr_attribution')?.value;
  if (!campaignId) return NextResponse.json({ tracked: false });

  const body = (await request.json().catch(() => ({}))) as { path?: string };
  const path = typeof body.path === 'string' && body.path.startsWith('/') ? body.path.slice(0, 160) : '/';
  const supabase = createAdminClient();
  const [{ data: campaignsRow }, { data: statsRow }] = await Promise.all([
    supabase.from('shop_settings').select('value').eq('key', 'qr_campaigns').maybeSingle(),
    supabase.from('shop_settings').select('value').eq('key', 'qr_stats').maybeSingle(),
  ]);
  const campaigns = Array.isArray(campaignsRow?.value) ? (campaignsRow.value as unknown as QrCampaign[]) : [];
  const campaign = campaigns.find((item) => item.id === campaignId);
  if (!campaign?.isActive || !campaign.partnerEnabled) return NextResponse.json({ tracked: false });

  const stats = statsRow?.value && typeof statsRow.value === 'object' && !Array.isArray(statsRow.value)
    ? (statsRow.value as unknown as Record<string, QrCampaignStats>)
    : {};
  const current = stats[campaignId] ?? { total: 0, lastScannedAt: null, days: {} };
  const next = {
    ...stats,
    [campaignId]: {
      ...current,
      pageViews: (current.pageViews ?? 0) + 1,
      paths: { ...current.paths, [path]: (current.paths?.[path] ?? 0) + 1 },
    },
  };
  await supabase.from('shop_settings').upsert({ key: 'qr_stats', value: next }, { onConflict: 'key' });
  return NextResponse.json({ tracked: true });
}
