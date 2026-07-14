'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  Truck,
  MapPin,
  User,
  Home,
  CreditCard,
  ArrowRight,
  Gift,
} from 'lucide-react';
import { useCart } from '@/lib/cart/CartProvider';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/LanguageProvider';

type ShippingMethod = {
  id: string;
  name: string;
  cost: number;
  requiresSignature: boolean;
};

type ShippingOption = {
  zone: string;
  methods: ShippingMethod[];
};

type GiftOffer = {
  enabled: boolean;
  minAmount?: number;
  title?: string;
  description?: string;
  product?: {
    name: string;
    slug: string;
    image: string | null;
    imageAlt: string | null;
  };
};

export default function PanierPage() {
  const { t } = useLanguage();
  const { items, total, count, removeItem, updateQuantity } = useCart();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
  });
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('RE');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[] | null>(null);
  const [shippingError, setShippingError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoEmail, setPromoEmail] = useState('');
  const [promoStatus, setPromoStatus] = useState<'idle' | 'valid' | 'invalid' | 'already_used' | 'not_subscribed' | 'loading'>('idle');
  const [promoLabel, setPromoLabel] = useState('');
  const [promoDiscount, setPromoDiscount] = useState<{ percentOff?: number; amountOff?: number } | null>(null);
  const [giftOffer, setGiftOffer] = useState<GiftOffer | null>(null);

  // Poids total du panier
  const cartWeightG = items.reduce((sum, item) => sum + (item.weightGrams ?? 0) * item.quantity, 0);

  // Trouver le coût de la méthode sélectionnée
  const shippingCost = shippingOptions
    ?.flatMap((o) => o.methods)
    .find((m) => m.id === selectedMethod)?.cost ?? 0;

  // Calcul de la réduction
  let discountAmount = 0;
  if (promoStatus === 'valid' && promoDiscount) {
    if (promoDiscount.percentOff) {
      discountAmount = total * (promoDiscount.percentOff / 100);
    } else if (promoDiscount.amountOff) {
      discountAmount = Math.min(promoDiscount.amountOff, total);
    }
  }
  const grandTotal = total - discountAmount + shippingCost;
  const contactComplete =
    customerInfo.name.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email.trim()) &&
    customerInfo.phone.trim().length >= 6;
  const addressComplete =
    customerInfo.addressLine1.trim().length > 3 &&
    customerInfo.city.trim().length > 1 &&
    postalCode.trim().length >= 4;
  const shippingComplete = Boolean(selectedMethod);
  const giftRemaining =
    giftOffer?.enabled && giftOffer.minAmount
      ? Math.max(0, giftOffer.minAmount - total)
      : null;
  const giftUnlocked = giftRemaining === 0;

  const setCustomerField = (field: keyof typeof customerInfo, value: string) => {
    setCustomerInfo((current) => ({ ...current, [field]: value }));
  };

  const fetchShipping = async (cp: string, ctry: string, weight: number) => {
    setLoadingShipping(true);
    setShippingError('');
    setSelectedMethod(null);

    try {
      const weightParam = weight > 0 ? `&weight=${weight}` : '';
      const res = await fetch(
        `/api/shipping?country=${ctry}&postal_code=${cp}${weightParam}`
      );
      const data = await res.json();

      if (!res.ok) {
        setShippingError(data.error || 'Zone non couverte. Contactez-nous.');
        setShippingOptions(null);
      } else {
        setShippingOptions(data.options);
      }
    } catch {
      setShippingError('Erreur de connexion');
      setShippingOptions(null);
    } finally {
      setLoadingShipping(false);
    }
  };

  const calculateShipping = () => {
    if (!postalCode.trim()) return;
    fetchShipping(postalCode.trim(), country, cartWeightG);
  };

  // Recalculer automatiquement quand le poids du panier change (ajout/suppression)
  const prevWeightRef = useRef(cartWeightG);
  useEffect(() => {
    if (!postalCode.trim() || !shippingOptions) return;
    if (prevWeightRef.current === cartWeightG) return;
    prevWeightRef.current = cartWeightG;
    fetchShipping(postalCode.trim(), country, cartWeightG);
  }, [cartWeightG, postalCode, country, shippingOptions]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/gift-offer')
      .then((res) => res.json())
      .then((data: GiftOffer) => {
        if (!cancelled) setGiftOffer(data);
      })
      .catch(() => {
        if (!cancelled) setGiftOffer(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const validatePromo = async () => {
    if (!promoCode.trim() || !promoEmail.trim()) return;
    setPromoStatus('loading');
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode.trim().toUpperCase(), email: promoEmail.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromoStatus('valid');
        setPromoLabel(data.label);
        setPromoDiscount(data.discount || null);
      } else if (data.reason === 'already_used') {
        setPromoStatus('already_used');
        setPromoLabel('');
        setPromoDiscount(null);
      } else if (data.reason === 'not_subscribed') {
        setPromoStatus('not_subscribed');
        setPromoLabel('');
        setPromoDiscount(null);
      } else {
        setPromoStatus('invalid');
        setPromoLabel('');
        setPromoDiscount(null);
      }
    } catch {
      setPromoStatus('invalid');
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          shippingMethodId: selectedMethod,
          customer: {
            name: customerInfo.name.trim(),
            email: customerInfo.email.trim(),
            phone: customerInfo.phone.trim(),
            address: {
              line1: customerInfo.addressLine1.trim(),
              line2: customerInfo.addressLine2.trim(),
              city: customerInfo.city.trim(),
              postalCode: postalCode.trim(),
              country,
            },
          },
          promoCode: promoStatus === 'valid' ? promoCode.trim().toUpperCase() : undefined,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || t('checkout.paymentError'));
        setCheckingOut(false);
      }
    } catch {
      alert('Erreur de connexion');
      setCheckingOut(false);
    }
  };

  if (count === 0) {
    return (
      <main className="pt-28 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={32} className="text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-ink">{t('cart.empty')}</h1>
          <p className="mt-3 text-gray-500">
            {t('checkout.emptySubtitle')}
          </p>
          <Link
            href="/boutique"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-jungle-700 text-cream text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-jungle-800 transition-colors"
          >
            <ShoppingBag size={16} />
            Voir la boutique
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-28 pb-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/boutique"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-ink">
            {t('cart.label', { count })}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = item.variantId
                ? `${item.productId}:${item.variantId}`
                : item.productId;

              return (
                <div
                  key={key}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4"
                >
                  <Link
                    href={`/boutique/${item.slug}`}
                    className="shrink-0 w-24 h-24 rounded-lg bg-gray-50 relative overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingBag size={24} />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/boutique/${item.slug}`}
                      className="text-sm font-semibold text-ink hover:text-jungle-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    {item.variantLabel && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.variantLabel}
                      </p>
                    )}
                    <p className="text-base font-bold text-jungle-700 mt-2">
                      {item.price.toFixed(2)} €
                    </p>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Minus size={14} className="text-gray-500" />
                        </button>
                        <span className="px-3 text-sm font-medium text-ink min-w-[32px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          disabled={item.maxQuantity != null && item.quantity >= item.maxQuantity}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId
                            )
                          }
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          <Plus size={14} className="text-gray-500" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-ink">
                          {(item.price * item.quantity).toFixed(2)} €
                        </span>
                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="p-1.5 rounded-lg text-gray-300 hover:text-coral-500 hover:bg-coral-50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé + Livraison */}
          <div className="space-y-4">
            {giftOffer?.enabled && giftOffer.minAmount && giftOffer.product && (
              <div className="overflow-hidden rounded-xl border border-sun-200 bg-sun-50">
                <div className="flex items-start gap-3 p-4">
                  <div className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-white text-jungle-800 ring-1 ring-sun-200">
                    {giftOffer.product.image ? (
                      <Image
                        src={giftOffer.product.image}
                        alt={giftOffer.product.imageAlt || giftOffer.product.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-jungle-800 text-cream">
                        <Gift size={18} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black uppercase tracking-[0.12em] text-ink">
                      {giftUnlocked ? t('checkout.giftUnlocked') : giftOffer.title || t('checkout.giftWaiting')}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-ink/65">
                      {giftUnlocked
                        ? t('checkout.giftAdded', { product: giftOffer.product.name })
                        : t('checkout.giftRemaining', { amount: giftRemaining?.toFixed(2) ?? '0', product: giftOffer.product.name })}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-jungle-700 transition-all"
                        style={{
                          width: `${Math.min(100, (total / giftOffer.minAmount) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { step: 1, label: t('checkout.contact'), icon: User, done: contactComplete },
                  { step: 2, label: t('checkout.address'), icon: Home, done: addressComplete },
                  { step: 3, label: t('checkout.payment'), icon: CreditCard, done: shippingComplete },
                ].map(({ step, label, icon: Icon, done }) => (
                  <button
                    key={step}
                    type="button"
                    onClick={() => {
                      if (step === 1 || (step === 2 && contactComplete) || (step === 3 && contactComplete && addressComplete)) {
                        setCheckoutStep(step);
                      }
                    }}
                    className={cn(
                      'rounded-lg border px-2 py-2 text-center transition-colors',
                      checkoutStep === step
                        ? 'border-jungle-500 bg-jungle-50 text-jungle-800'
                        : done
                          ? 'border-jungle-100 bg-white text-jungle-700'
                          : 'border-gray-100 bg-gray-50 text-gray-400'
                    )}
                  >
                    <span className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full bg-white">
                      <Icon size={14} />
                    </span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide">
                      {t('checkout.step', { step })}
                    </span>
                    <span className="block text-xs font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {checkoutStep === 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <User size={16} className="text-gray-500" />
                  <h3 className="font-semibold text-ink text-sm">{t('checkout.details')}</h3>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerField('name', e.target.value)}
                    placeholder={t('checkout.fullName')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => {
                      setCustomerField('email', e.target.value);
                      setPromoEmail(e.target.value);
                    }}
                    placeholder={t('checkout.email')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerField('phone', e.target.value)}
                    placeholder={t('checkout.phone')}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => setCheckoutStep(2)}
                    disabled={!contactComplete}
                    className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {t('checkout.continue')}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className={cn('bg-white rounded-xl border border-gray-200 p-5', checkoutStep === 1 && 'hidden')}>
              <div className="flex items-center gap-2 mb-4">
                <Truck size={16} className="text-gray-500" />
                <h3 className="font-semibold text-ink text-sm">
                  {checkoutStep === 2 ? t('checkout.shippingAddress') : t('checkout.shipping')}
                </h3>
              </div>

              <div className={cn('space-y-3', checkoutStep !== 2 && 'hidden')}>
                <input
                  type="text"
                  value={customerInfo.addressLine1}
                  onChange={(e) => setCustomerField('addressLine1', e.target.value)}
                  placeholder={t('checkout.address')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                />
                <input
                  type="text"
                  value={customerInfo.addressLine2}
                  onChange={(e) => setCustomerField('addressLine2', e.target.value)}
                  placeholder={t('checkout.address2')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                />
                <input
                  type="text"
                  value={customerInfo.city}
                  onChange={(e) => setCustomerField('city', e.target.value)}
                  placeholder={t('checkout.city')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                />
                <div className="flex flex-wrap gap-2">
                  <select
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setShippingOptions(null);
                    }}
                    className="px-2 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  >
                    <option value="RE">{t('checkout.reunion')}</option>
                    <option value="FR">{t('checkout.france')}</option>
                  </select>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && calculateShipping()}
                    placeholder={t('checkout.postalCode')}
                    className="flex-1 min-w-[100px] px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <button
                    onClick={calculateShipping}
                    disabled={loadingShipping || !postalCode.trim()}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors disabled:opacity-40"
                  >
                    {loadingShipping ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'OK'
                    )}
                  </button>
                </div>
                {shippingError && (
                  <p className="text-xs text-coral-500">{shippingError}</p>
                )}
                <button
                  type="button"
                  onClick={() => setCheckoutStep(3)}
                  disabled={!addressComplete || !shippingOptions}
                  className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  Choisir la livraison
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className={cn('space-y-3', checkoutStep !== 3 && 'hidden')}>
                {shippingError && (
                  <p className="text-xs text-coral-500">{shippingError}</p>
                )}

                {shippingOptions && (
                  <div className="rounded-xl border border-jungle-100 bg-jungle-50/70 px-4 py-3 text-xs leading-relaxed text-jungle-800">
                    <p className="font-semibold text-ink">
                      {t('checkout.shipTitle')}
                    </p>
                    <p className="mt-1 text-jungle-800/75">
                      {t('checkout.shipHelp')}
                    </p>
                  </div>
                )}

                {shippingOptions && shippingOptions.map((option) => (
                  <div key={option.zone} className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 flex items-center gap-1 pt-1">
                      <MapPin size={12} />
                      {option.zone}
                    </p>
                    {option.methods.map((method) => (
                      <label
                        key={method.id}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors',
                          selectedMethod === method.id
                            ? 'border-jungle-500 bg-jungle-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={selectedMethod === method.id}
                            onChange={() => setSelectedMethod(method.id)}
                            className="text-jungle-600 focus:ring-jungle-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-ink">
                              {method.name}
                            </p>
                            {method.requiresSignature && (
                              <p className="text-[10px] text-ocean-600">
                                Avec signature
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-bold text-ink">
                          {method.cost.toFixed(2)} €
                        </span>
                      </label>
                    ))}
                  </div>
                ))}

                {!shippingOptions && !shippingError && (
                  <p className="text-xs text-gray-400">
                    {t('checkout.completeAddress')}
                  </p>
                )}
              </div>
            </div>

            {/* Code promo */}
            <div className={cn('bg-white rounded-xl border border-gray-200 p-5', checkoutStep !== 3 && 'hidden')}>
              <h3 className="font-semibold text-ink text-sm mb-3">{t('checkout.promo')}</h3>
              <div className="space-y-2">
                <input
                  type="email"
                  value={promoEmail}
                  onChange={(e) => {
                    setPromoEmail(e.target.value);
                    if (promoStatus !== 'idle') setPromoStatus('idle');
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && validatePromo()}
                  placeholder={t('checkout.yourEmail')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value.toUpperCase());
                      if (promoStatus !== 'idle') setPromoStatus('idle');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && validatePromo()}
                    placeholder="Ex : BIENVENUE10"
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm uppercase tracking-wide focus:outline-none focus:ring-1 focus:ring-jungle-500/30"
                  />
                  <button
                    onClick={validatePromo}
                    disabled={promoStatus === 'loading' || !promoCode.trim() || !promoEmail.trim()}
                    className="px-4 py-2 bg-jungle-700 text-cream text-sm font-bold rounded-lg hover:bg-jungle-800 transition-colors disabled:opacity-40"
                  >
                    {promoStatus === 'loading' ? <Loader2 size={14} className="animate-spin" /> : 'OK'}
                  </button>
                </div>
              </div>
              {promoStatus === 'valid' && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  {promoLabel}
                </p>
              )}
              {promoStatus === 'invalid' && (
                <p className="text-xs text-coral-500 mt-2">
                  {t('checkout.invalidPromo')}
                </p>
              )}
              {promoStatus === 'already_used' && (
                <p className="text-xs text-coral-500 mt-2">
                  {t('checkout.usedPromo')}
                </p>
              )}
              {promoStatus === 'not_subscribed' && (
                <p className="text-xs text-coral-500 mt-2">
                  {t('checkout.newsletterPromo')}
                </p>
              )}
            </div>

            {/* Total */}
            <div className={cn('bg-white rounded-xl border border-gray-200 p-5 space-y-3', checkoutStep !== 3 && 'hidden')}>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('cart.subtotal')}</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              {promoStatus === 'valid' && discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{t('checkout.promo')} ({promoLabel})</span>
                  <span>-{discountAmount.toFixed(2)} €</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('checkout.shipping')}</span>
                <span>
                  {shippingOptions
                    ? selectedMethod
                      ? `${shippingCost.toFixed(2)} €`
                      : t('checkout.select')
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-ink pt-3 border-t border-gray-100">
                <span>{t('checkout.total')}</span>
                <span>{grandTotal.toFixed(2)} €</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={checkingOut || !contactComplete || !addressComplete || !selectedMethod}
                className="w-full py-3 bg-jungle-700 hover:bg-jungle-800 text-cream text-sm font-bold uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-2 mt-2"
              >
                {checkingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Redirection...
                  </>
                ) : (
                  t('cart.checkout', { total: grandTotal.toFixed(2) })
                )}
              </button>

              {!selectedMethod && shippingOptions && (
                <p className="text-xs text-coral-500 text-center">
                  Choisissez un mode de livraison
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
