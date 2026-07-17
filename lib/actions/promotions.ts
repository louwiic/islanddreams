'use server';

import type Stripe from 'stripe';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/admin';
import { getStripeClient } from '@/lib/stripe/client';

const SOURCE = 'island-dreams-admin-promotion';

export type AdminPromotion = {
  id: string;
  code: string;
  name: string;
  discountType: 'percent' | 'amount';
  value: number;
  active: boolean;
  validFrom: string | null;
  expiresAt: string | null;
  minimumAmount: number | null;
  timesRedeemed: number;
  maxRedemptions: number | null;
  note: string;
  createdAt: string;
};

export type CreatePromotionInput = {
  code: string;
  name: string;
  discountType: 'percent' | 'amount';
  value: string;
  validFrom?: string;
  expiresAt?: string;
  minimumAmount?: string;
  maxRedemptions?: string;
  note?: string;
};

function parseNumber(value?: string) {
  if (!value?.trim()) return null;
  const number = Number(value.replace(',', '.'));
  return Number.isFinite(number) ? number : null;
}

function toTimestamp(value?: string, endOfDay = false) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function mapPromotion(promo: Stripe.PromotionCode): AdminPromotion | null {
  if (promo.metadata?.source !== SOURCE) return null;
  const coupon = typeof promo.promotion.coupon === 'string' ? null : promo.promotion.coupon;
  const discountType = promo.metadata.discountType === 'amount' ? 'amount' : 'percent';
  const fallbackValue = discountType === 'amount'
    ? Number(coupon?.amount_off || 0) / 100
    : Number(coupon?.percent_off || 0);
  return {
    id: promo.id,
    code: promo.code,
    name: promo.metadata.name || coupon?.name || promo.code,
    discountType,
    value: Number(promo.metadata.value || fallbackValue),
    active: promo.active,
    validFrom: promo.metadata.validFrom || null,
    expiresAt: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
    minimumAmount: promo.restrictions?.minimum_amount ? promo.restrictions.minimum_amount / 100 : null,
    timesRedeemed: promo.times_redeemed,
    maxRedemptions: promo.max_redemptions,
    note: promo.metadata.note || '',
    createdAt: new Date(promo.created * 1000).toISOString(),
  };
}

export async function getAdminPromotions(): Promise<AdminPromotion[]> {
  await requireAdmin();
  const stripe = getStripeClient();
  const promos = await stripe.promotionCodes.list({ limit: 100, expand: ['data.promotion.coupon'] });
  return promos.data.map(mapPromotion).filter((item): item is AdminPromotion => Boolean(item));
}

export async function createAdminPromotion(input: CreatePromotionInput) {
  await requireAdmin();
  const code = input.code.trim().toUpperCase().replace(/\s+/g, '-');
  const name = input.name.trim();
  const value = parseNumber(input.value);
  const minimumAmount = parseNumber(input.minimumAmount);
  const maxRedemptions = parseNumber(input.maxRedemptions);
  const validFrom = toTimestamp(input.validFrom);
  const expiresAt = toTimestamp(input.expiresAt, true);

  if (!code || !name || !value || value <= 0) return { error: 'Code, nom et réduction sont obligatoires.' };
  if (input.discountType === 'percent' && value > 100) return { error: 'Le pourcentage ne peut pas dépasser 100 %.' };
  if (expiresAt && expiresAt.getTime() <= Date.now()) return { error: 'La date de fin doit être future.' };
  if (validFrom && expiresAt && validFrom >= expiresAt) return { error: 'La date de début doit précéder la date de fin.' };

  const stripe = getStripeClient();
  const metadata = {
    source: SOURCE,
    name,
    discountType: input.discountType,
    value: value.toFixed(2),
    validFrom: validFrom?.toISOString() || '',
    note: input.note?.trim() || '',
  };
  const coupon = await stripe.coupons.create({
    duration: 'once',
    name,
    ...(input.discountType === 'percent'
      ? { percent_off: value }
      : { amount_off: Math.round(value * 100), currency: 'eur' }),
    metadata,
  });

  try {
    const promo = await stripe.promotionCodes.create({
      promotion: { type: 'coupon', coupon: coupon.id },
      code,
      ...(expiresAt ? { expires_at: Math.floor(expiresAt.getTime() / 1000) } : {}),
      ...(maxRedemptions && maxRedemptions > 0 ? { max_redemptions: Math.floor(maxRedemptions) } : {}),
      ...(minimumAmount && minimumAmount > 0
        ? { restrictions: { minimum_amount: Math.round(minimumAmount * 100), minimum_amount_currency: 'eur' } }
        : {}),
      metadata,
    });
    revalidatePath('/admin/codes-promo');
    return { promotion: mapPromotion(promo) };
  } catch (error) {
    await stripe.coupons.del(coupon.id).catch(() => undefined);
    return { error: error instanceof Error ? error.message : 'Impossible de créer le code promo.' };
  }
}

export async function deactivateAdminPromotion(id: string) {
  await requireAdmin();
  const promo = await getStripeClient().promotionCodes.update(id, { active: false });
  revalidatePath('/admin/codes-promo');
  return { promotion: mapPromotion(promo) };
}
