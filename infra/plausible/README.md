# Plausible Islanddreams

Self-hosted Plausible CE v3.2.1 on the existing Coolify server (137.74.171.48).

- Dashboard: https://plausible-3mp6dcpkdkhsmavn73gbfgta.137.74.171.48.sslip.io
- Coolify service: `3mp6dcpkdkhsmavn73gbfgta`, project `c9psh2yej6mdxrvshxld61cd`, production.
- Compose file is for Coolify's **Docker Compose** resource type: Coolify generates `SERVICE_*` secrets and writes bind mount `content` to disk. No secret values belong in Git.
- Durable volumes: PostgreSQL account/site settings, ClickHouse events, Plausible runtime data. Neither database publishes a host port; stack network only.
- Memory caps: app 768 MiB, PostgreSQL 384 MiB, ClickHouse 1536 MiB. The original server had 5 GiB available before installation.
- HTTPS managed by Coolify. A dedicated DNS name can replace the generated sslip.io name later; update `NEXT_PUBLIC_PLAUSIBLE_URL` and redeploy the site as well.
- Registration disabled after the initial owner is created. Dashboard stays private. Owner password is entered by the owner, never committed.
- SMTP is not configured for Plausible: emailed reports, invites and password reset mail are unavailable until configured.
- Persistent volumes survive redeployments, but are not an off-server backup. Include both PostgreSQL and ClickHouse in the server backup policy.

Official sources: [CE compose](https://github.com/plausible/community-edition/tree/v3.2.1), [Coolify template](https://coolify.io/docs/services/plausible), [Events API](https://plausible.io/docs/events-api).

## Website measurement

Set `NEXT_PUBLIC_PLAUSIBLE_URL` to the public HTTPS dashboard origin **before building** the Next.js site. No Plausible API key is required to submit public events.

The client uses Plausible's Events API directly. This allows stripping all query strings, fragments and arbitrary event properties before transmission. The browser sends its own User-Agent and the server observes the visitor connection, as required for anonymous daily visitor counting. No proxy sends Vercel's IP in place of visitors.

| Event | Trigger |
| --- | --- |
| `pageview` | Public page navigation after accepted consent, once per pathname transition |
| `cart_item_added` | An explicit add-to-cart action (not cart hydration) |
| `checkout_started` | A successful Checkout API response, immediately before redirecting to Stripe |
| Existing footer / editorial link / contest events | Existing click and successful participation handlers |

Create custom event goals for `cart_item_added` and `checkout_started` in the dashboard. A visit to `/checkout/succes` is **not proof of payment** and is not reported as a purchase. Verified purchase revenue tracking is not part of this installation.

Guards:

- No request before acceptance, after rejection, with `plausible_ignore=true`, or when Global Privacy Control is enabled.
- Only HTTPS `islanddreams.re` and `www.islanddreams.re`; previews and localhost do not contaminate production.
- Account, admin, auth, partner and unsubscribe routes excluded.
- Canonical URL contains pathname only; no Stripe session ID, reset token, query, fragment, personal form field or event properties.
- Referrer reduced to origin. Campaign query parameters are intentionally not collected.
- Network failures never interrupt shopping or checkout. Statistics do not depend on the commerce database.

Checks: `node --test scripts/test-analytics.cjs scripts/test-checkout.cjs`, targeted ESLint and `npm run build`. Confirm a browser visit appears in Plausible after creating the site entry `islanddreams.re` (timezone `Indian/Reunion`). Goals must be created before their events can be counted.
