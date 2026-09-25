-- Complete the regional delivery coverage for La Réunion.
-- The postal zone already covers 974*, but local-delivery zones also need
-- their commune postcodes so the checkout can offer the correct local rates.

INSERT INTO shipping_zone_postcodes (zone_id, country, postcode_pattern)
SELECT z.id, 'RE', codes.postcode_pattern
FROM shipping_zones AS z
CROSS JOIN (
  VALUES
    ('97413'), -- Cilaos
    ('97442'), -- Saint-Philippe
    ('97480')  -- Saint-Joseph
) AS codes(postcode_pattern)
WHERE z.name = 'Zone 1 — Sud proche'
  AND NOT EXISTS (
    SELECT 1
    FROM shipping_zone_postcodes AS existing
    WHERE existing.zone_id = z.id
      AND existing.country = 'RE'
      AND existing.postcode_pattern = codes.postcode_pattern
  );

INSERT INTO shipping_zone_postcodes (zone_id, country, postcode_pattern)
SELECT z.id, 'RE', codes.postcode_pattern
FROM shipping_zones AS z
CROSS JOIN (
  VALUES
    ('97426') -- Trois-Bassins
) AS codes(postcode_pattern)
WHERE z.name = 'Zone 2 — Sud / Ouest'
  AND NOT EXISTS (
    SELECT 1
    FROM shipping_zone_postcodes AS existing
    WHERE existing.zone_id = z.id
      AND existing.country = 'RE'
      AND existing.postcode_pattern = codes.postcode_pattern
  );

INSERT INTO shipping_zone_postcodes (zone_id, country, postcode_pattern)
SELECT z.id, 'RE', codes.postcode_pattern
FROM shipping_zones AS z
CROSS JOIN (
  VALUES
    ('97412'), -- Bras-Panon
    ('97437')  -- Saint-Benoît
) AS codes(postcode_pattern)
WHERE z.name = 'Zone 3 — Ouest / Est'
  AND NOT EXISTS (
    SELECT 1
    FROM shipping_zone_postcodes AS existing
    WHERE existing.zone_id = z.id
      AND existing.country = 'RE'
      AND existing.postcode_pattern = codes.postcode_pattern
  );

INSERT INTO shipping_zone_postcodes (zone_id, country, postcode_pattern)
SELECT z.id, 'RE', '97440'
FROM shipping_zones AS z
WHERE z.name = 'Zone 4 — Nord'
  AND NOT EXISTS (
    SELECT 1
    FROM shipping_zone_postcodes AS existing
    WHERE existing.zone_id = z.id
      AND existing.country = 'RE'
      AND existing.postcode_pattern = '97440'
  );
