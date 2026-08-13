import type { TaxConfiguration, TaxQuote, TaxZone } from './types';

export const DEFAULT_TAX_CONFIGURATION: TaxConfiguration = {
  enabled: true,
  catalogPricesIncludeTax: true,
  catalogTaxRate: 8.5,
  zones: [
    {
      id: 'reunion',
      name: 'La Réunion',
      countries: ['RE'],
      postcodePrefixes: [],
      mode: 'included',
      rate: 8.5,
      taxShipping: true,
      enabled: true,
      notice: 'TVA Réunion incluse dans le prix.',
    },
    {
      id: 'france-metropolitaine',
      name: 'France métropolitaine',
      countries: ['FR'],
      postcodePrefixes: [],
      mode: 'not_collected',
      rate: 0,
      taxShipping: false,
      enabled: true,
      notice:
        'Vente hors taxe. La TVA d’importation et les frais de dédouanement éventuels pourront être demandés au destinataire à la livraison.',
    },
    {
      id: 'international',
      name: 'International',
      countries: ['*'],
      postcodePrefixes: [],
      mode: 'not_collected',
      rate: 0,
      taxShipping: false,
      enabled: true,
      notice:
        'Vente hors taxe. Les taxes, droits et frais d’importation éventuels restent à la charge du destinataire.',
    },
  ],
};

export function roundMoney(value: number) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function finiteRate(value: unknown, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
}

export function normalizeTaxConfiguration(value: unknown): TaxConfiguration {
  if (!value || typeof value !== 'object') return DEFAULT_TAX_CONFIGURATION;

  const raw = value as Partial<TaxConfiguration>;
  const zones = Array.isArray(raw.zones)
    ? raw.zones
        .filter((zone): zone is TaxZone => Boolean(zone && typeof zone === 'object'))
        .map((zone, index) => ({
          id: String(zone.id || `zone-${index + 1}`),
          name: String(zone.name || `Zone ${index + 1}`),
          countries: Array.isArray(zone.countries)
            ? zone.countries.map((country) => String(country).trim().toUpperCase()).filter(Boolean)
            : [],
          postcodePrefixes: Array.isArray(zone.postcodePrefixes)
            ? zone.postcodePrefixes.map((prefix) => String(prefix).trim().toUpperCase()).filter(Boolean)
            : [],
          mode: ['included', 'added', 'not_collected'].includes(zone.mode)
            ? zone.mode
            : 'not_collected',
          rate: finiteRate(zone.rate, 0),
          taxShipping: Boolean(zone.taxShipping),
          enabled: zone.enabled !== false,
          notice: String(zone.notice || ''),
        }))
    : DEFAULT_TAX_CONFIGURATION.zones;

  return {
    enabled: raw.enabled !== false,
    catalogPricesIncludeTax: raw.catalogPricesIncludeTax !== false,
    catalogTaxRate: finiteRate(raw.catalogTaxRate, 8.5),
    zones: zones.length > 0 ? zones : DEFAULT_TAX_CONFIGURATION.zones,
  };
}

export function resolveTaxZone(
  config: TaxConfiguration,
  country: string,
  postalCode = ''
): TaxZone {
  const normalizedCountry = country.trim().toUpperCase();
  const normalizedPostcode = postalCode.replace(/\s/g, '').toUpperCase();
  const enabledZones = config.zones.filter((zone) => zone.enabled);

  const exact = enabledZones.find((zone) => {
    if (!zone.countries.includes(normalizedCountry)) return false;
    if (zone.postcodePrefixes.length === 0) return true;
    return zone.postcodePrefixes.some((prefix) => normalizedPostcode.startsWith(prefix));
  });

  return (
    exact ||
    enabledZones.find((zone) => zone.countries.includes('*')) ||
    DEFAULT_TAX_CONFIGURATION.zones[2]
  );
}

export function catalogAmountToNet(amount: number, config: TaxConfiguration) {
  if (!config.catalogPricesIncludeTax || config.catalogTaxRate <= 0) return roundMoney(amount);
  return roundMoney(amount / (1 + config.catalogTaxRate / 100));
}

export function priceForTaxZone(
  catalogAmount: number,
  config: TaxConfiguration,
  zone: TaxZone
) {
  if (!config.enabled) {
    return { stripeUnitAmount: roundMoney(catalogAmount), customerAmount: roundMoney(catalogAmount) };
  }

  if (zone.mode === 'included') {
    return { stripeUnitAmount: roundMoney(catalogAmount), customerAmount: roundMoney(catalogAmount) };
  }

  const net = catalogAmountToNet(catalogAmount, config);
  if (zone.mode === 'added') {
    return {
      stripeUnitAmount: net,
      customerAmount: roundMoney(net * (1 + zone.rate / 100)),
    };
  }

  return { stripeUnitAmount: net, customerAmount: net };
}

export function calculateTaxQuote(params: {
  config: TaxConfiguration;
  country: string;
  postalCode?: string;
  catalogSubtotal: number;
  shipping: number;
  discountPercent?: number;
  discountAmount?: number;
}): TaxQuote {
  const { config } = params;
  const zone = resolveTaxZone(config, params.country, params.postalCode);
  const merchandise = priceForTaxZone(Math.max(0, params.catalogSubtotal), config, zone).customerAmount;
  const percentDiscount = Math.max(0, Math.min(100, Number(params.discountPercent) || 0));
  const fixedDiscount = Math.max(0, Number(params.discountAmount) || 0);
  const discount = percentDiscount > 0
    ? merchandise * (percentDiscount / 100)
    : Math.min(fixedDiscount, merchandise);
  const discountedMerchandise = roundMoney(Math.max(0, merchandise - discount));

  let shippingAmount = roundMoney(Math.max(0, params.shipping));
  let taxAmount = 0;

  if (config.enabled && zone.mode === 'included' && zone.rate > 0) {
    taxAmount = discountedMerchandise * (zone.rate / (100 + zone.rate));
    if (zone.taxShipping) {
      taxAmount += shippingAmount * (zone.rate / (100 + zone.rate));
    }
  } else if (config.enabled && zone.mode === 'added' && zone.rate > 0) {
    taxAmount = discountedMerchandise * (zone.rate / (100 + zone.rate));
    if (zone.taxShipping) {
      shippingAmount = roundMoney(shippingAmount * (1 + zone.rate / 100));
      taxAmount += shippingAmount * (zone.rate / (100 + zone.rate));
    }
  }

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    mode: zone.mode,
    rate: zone.rate,
    merchandiseBeforeDiscount: merchandise,
    discountAmount: roundMoney(discount),
    merchandiseAmount: discountedMerchandise,
    shippingAmount,
    taxAmount: roundMoney(taxAmount),
    total: roundMoney(discountedMerchandise + shippingAmount),
    taxCollected: config.enabled && zone.mode !== 'not_collected' && zone.rate > 0,
    taxIncluded: zone.mode === 'included',
    notice: zone.notice,
  };
}
