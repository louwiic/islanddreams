'use server';

import { randomBytes } from 'crypto';
import { revalidatePath } from 'next/cache';
import type Stripe from 'stripe';
import { getStripeClient } from '@/lib/stripe/client';

const ADMIN_VOUCHER_SOURCE = 'island-dreams-admin-voucher';

export type AdminVoucher = {
  id: string;
  code: string;
  amount: number;
  active: boolean;
  createdAt: string;
  expiresAt: string | null;
  timesRedeemed: number;
  maxRedemptions: number | null;
  recipientName: string;
  recipientEmail: string;
  note: string;
};

export type CreateAdminVoucherInput = {
  amount: string;
  expiresAt: string;
  recipientName?: string;
  recipientEmail?: string;
  note?: string;
  code?: string;
};

function generateVoucherCode() {
  return `ID${randomBytes(4).toString('hex').toUpperCase()}`;
}

function parseAmount(value: string) {
  const amount = Number(String(value).replace(',', '.'));
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

function parseExpiry(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime()) || date.getTime() < Date.now()) return null;
  return date;
}

function couponAmount(coupon: string | Stripe.Coupon | null | undefined) {
  if (!coupon || typeof coupon === 'string') return 0;
  return (coupon.amount_off ?? 0) / 100;
}

function mapPromotionCode(promo: Stripe.PromotionCode): AdminVoucher | null {
  if (promo.metadata?.source !== ADMIN_VOUCHER_SOURCE) return null;

  return {
    id: promo.id,
    code: promo.code,
    amount: couponAmount(promo.promotion.coupon) || Number(promo.metadata?.amount || 0),
    active: promo.active,
    createdAt: new Date(promo.created * 1000).toISOString(),
    expiresAt: promo.expires_at ? new Date(promo.expires_at * 1000).toISOString() : null,
    timesRedeemed: promo.times_redeemed,
    maxRedemptions: promo.max_redemptions,
    recipientName: promo.metadata?.recipientName || '',
    recipientEmail: promo.metadata?.recipientEmail || '',
    note: promo.metadata?.note || '',
  };
}

export async function getAdminVouchers(): Promise<AdminVoucher[]> {
  const stripe = getStripeClient();
  const promos = await stripe.promotionCodes.list({
    limit: 100,
    expand: ['data.promotion.coupon'],
  });

  return promos.data
    .map(mapPromotionCode)
    .filter((voucher): voucher is AdminVoucher => Boolean(voucher))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createAdminVoucher(input: CreateAdminVoucherInput) {
  const amount = parseAmount(input.amount);
  if (!amount || amount < 1 || amount > 1000) {
    return { error: 'Montant invalide. Utilisez un montant entre 1 € et 1000 €.' };
  }

  const expiresAt = parseExpiry(input.expiresAt);
  if (!expiresAt) {
    return { error: 'Date limite invalide ou déjà passée.' };
  }

  const stripe = getStripeClient();
  const coupon = await stripe.coupons.create({
    amount_off: Math.round(amount * 100),
    currency: 'eur',
    duration: 'once',
    name: `Bon d'achat Island Dreams ${amount.toFixed(2)} €`,
    metadata: {
      source: ADMIN_VOUCHER_SOURCE,
      amount: amount.toFixed(2),
      recipientName: input.recipientName?.trim() || '',
      recipientEmail: input.recipientEmail?.trim() || '',
      note: input.note?.trim() || '',
    },
  });

  const requestedCode = input.code?.trim().toUpperCase().replace(/\s+/g, '-');
  let lastError = '';

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = requestedCode || generateVoucherCode();
    try {
      const promo = await stripe.promotionCodes.create({
        promotion: {
          type: 'coupon',
          coupon: coupon.id,
        },
        code,
        max_redemptions: 1,
        expires_at: Math.floor(expiresAt.getTime() / 1000),
        metadata: {
          source: ADMIN_VOUCHER_SOURCE,
          amount: amount.toFixed(2),
          recipientName: input.recipientName?.trim() || '',
          recipientEmail: input.recipientEmail?.trim() || '',
          note: input.note?.trim() || '',
        },
      });

      revalidatePath('/admin/bons-achat');
      return { voucher: mapPromotionCode(promo) };
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Erreur Stripe';
      if (requestedCode) break;
    }
  }

  return { error: lastError || 'Impossible de créer le bon d’achat.' };
}

export async function deactivateAdminVoucher(id: string) {
  const stripe = getStripeClient();
  const promo = await stripe.promotionCodes.update(id, { active: false });
  revalidatePath('/admin/bons-achat');
  return { voucher: mapPromotionCode(promo) };
}
