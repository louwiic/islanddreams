export type TaxMode = 'included' | 'added' | 'not_collected';

export type TaxZone = {
  id: string;
  name: string;
  countries: string[];
  postcodePrefixes: string[];
  mode: TaxMode;
  rate: number;
  taxShipping: boolean;
  enabled: boolean;
  notice: string;
};

export type TaxConfiguration = {
  enabled: boolean;
  catalogPricesIncludeTax: boolean;
  catalogTaxRate: number;
  zones: TaxZone[];
};

export type TaxQuote = {
  zoneId: string;
  zoneName: string;
  mode: TaxMode;
  rate: number;
  merchandiseBeforeDiscount: number;
  discountAmount: number;
  merchandiseAmount: number;
  shippingAmount: number;
  taxAmount: number;
  total: number;
  taxCollected: boolean;
  taxIncluded: boolean;
  notice: string;
};
