import Stripe from 'stripe';

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      'STRIPE_SECRET_KEY manquante. Ajouter dans .env.local (Dashboard Stripe > API keys).'
    );
  }
  return new Stripe(key, { typescript: true });
}

// Lazy init — ne crash pas au build si la clé est absente
let _stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!_stripe) _stripe = getStripe();
  return _stripe;
}
