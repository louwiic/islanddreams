// Données des 24 communes de La Réunion
// Positions calibrées sur la carte illustrée (% relatifs à l'image)
// Images : visuels des stickers/magnets depuis Supabase Storage

const STORAGE_BASE = 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images';

export type Commune = {
  id: string;
  name: string;
  postalCode: string;
  color: string;
  image: string;
  // Position sur la carte illustrée (pourcentages)
  mapTarget: { x: number; y: number; rotation: number };
};

export const communes: Commune[] = [
  // ── Nord ─────────────────────────────────
  {
    id: 'saint-denis',
    name: 'Saint-Denis',
    postalCode: '97400',
    color: 'var(--color-ocean-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-denis-97400/0.jpg`,
    mapTarget: { x: 38, y: 5, rotation: -3 },
  },
  {
    id: 'sainte-marie',
    name: 'Sainte-Marie',
    postalCode: '97438',
    color: 'var(--color-jungle-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-sainte-marie-97438/0.jpg`,
    mapTarget: { x: 55, y: 5, rotation: 4 },
  },
  {
    id: 'sainte-suzanne',
    name: 'Sainte-Suzanne',
    postalCode: '97441',
    color: 'var(--color-sun-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-sainte-suzanne-97441/0.jpg`,
    mapTarget: { x: 68, y: 7, rotation: -2 },
  },
  {
    id: 'saint-andre',
    name: 'Saint-André',
    postalCode: '97440',
    color: 'var(--color-flamboyant)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-andre-97440/0.jpg`,
    mapTarget: { x: 80, y: 10, rotation: 5 },
  },
  // ── Est ──────────────────────────────────
  {
    id: 'bras-panon',
    name: 'Bras-Panon',
    postalCode: '97412',
    color: 'var(--color-sun-300)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-bras-panon-97412/0.jpg`,
    mapTarget: { x: 73, y: 20, rotation: -4 },
  },
  {
    id: 'saint-benoit',
    name: 'Saint-Benoît',
    postalCode: '97470',
    color: 'var(--color-flamboyant)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-anne-97470/0.jpg`,
    mapTarget: { x: 82, y: 34, rotation: 3 },
  },
  {
    id: 'plaine-des-palmistes',
    name: 'Plaine des Palmistes',
    postalCode: '97431',
    color: 'var(--color-sun-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-plaine-des-palmistes-97431/0.jpg`,
    mapTarget: { x: 68, y: 46, rotation: -6 },
  },
  {
    id: 'sainte-rose',
    name: 'Sainte-Rose',
    postalCode: '97439',
    color: 'var(--color-flamboyant)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-sainte-rose-97439/0.jpg`,
    mapTarget: { x: 90, y: 45, rotation: 5 },
  },
  // ── Sud ──────────────────────────────────
  {
    id: 'saint-philippe',
    name: 'Saint-Philippe',
    postalCode: '97442',
    color: 'var(--color-coral-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-philippe-97442/0.jpg`,
    mapTarget: { x: 85, y: 75, rotation: -3 },
  },
  {
    id: 'saint-joseph',
    name: 'Saint-Joseph',
    postalCode: '97480',
    color: 'var(--color-coral-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-joseph-97480/0.jpg`,
    mapTarget: { x: 68, y: 85, rotation: 4 },
  },
  {
    id: 'petite-ile',
    name: 'Petite-Île',
    postalCode: '97429',
    color: 'var(--color-coral-300)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-petite-ile-97429/0.jpg`,
    mapTarget: { x: 55, y: 92, rotation: -5 },
  },
  {
    id: 'saint-pierre',
    name: 'Saint-Pierre',
    postalCode: '97410',
    color: 'var(--color-coral-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-pierre-97410/0.jpg`,
    mapTarget: { x: 42, y: 90, rotation: 6 },
  },
  {
    id: 'le-tampon',
    name: 'Le Tampon',
    postalCode: '97430',
    color: 'var(--color-jungle-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-le-tampon-97430/0.jpg`,
    mapTarget: { x: 55, y: 68, rotation: -2 },
  },
  {
    id: 'entre-deux',
    name: 'Entre-Deux',
    postalCode: '97414',
    color: 'var(--color-ocean-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-entre-deux-97414/0.jpg`,
    mapTarget: { x: 44, y: 68, rotation: 3 },
  },
  {
    id: 'saint-louis',
    name: 'Saint-Louis',
    postalCode: '97450',
    color: 'var(--color-coral-600)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-louis-97450/0.jpg`,
    mapTarget: { x: 34, y: 70, rotation: -4 },
  },
  {
    id: 'etang-sale',
    name: 'Étang-Salé',
    postalCode: '97427',
    color: 'var(--color-bougainvillea)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-etang-sale-97427/0.jpg`,
    mapTarget: { x: 25, y: 74, rotation: 5 },
  },
  // ── Ouest ───────────────────────────────
  {
    id: 'les-avirons',
    name: 'Les Avirons',
    postalCode: '97425',
    color: 'var(--color-bougainvillea)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-les-avirons-97425/0.jpg`,
    mapTarget: { x: 18, y: 68, rotation: -6 },
  },
  {
    id: 'saint-leu',
    name: 'Saint-Leu',
    postalCode: '97436',
    color: 'var(--color-bougainvillea)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-leu-97436/0.jpg`,
    mapTarget: { x: 13, y: 55, rotation: 4 },
  },
  {
    id: 'trois-bassins',
    name: 'Trois-Bassins',
    postalCode: '97426',
    color: 'var(--color-ocean-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-les-trois-bassins-97426/0.jpg`,
    mapTarget: { x: 13, y: 43, rotation: -3 },
  },
  {
    id: 'saint-paul',
    name: 'Saint-Paul',
    postalCode: '97460',
    color: 'var(--color-ocean-600)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-saint-paul-97460/0.jpg`,
    mapTarget: { x: 10, y: 28, rotation: 6 },
  },
  {
    id: 'la-possession',
    name: 'La Possession',
    postalCode: '97419',
    color: 'var(--color-ocean-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-la-possession-97419/0.jpg`,
    mapTarget: { x: 16, y: 12, rotation: -2 },
  },
  {
    id: 'le-port',
    name: 'Le Port',
    postalCode: '97420',
    color: 'var(--color-sun-400)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-le-port-97420/0.jpg`,
    mapTarget: { x: 7, y: 8, rotation: 5 },
  },
  // ── Cirques & Intérieur ─────────────────
  {
    id: 'cilaos',
    name: 'Cilaos',
    postalCode: '97413',
    color: 'var(--color-jungle-600)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-cilaos-97413/0.jpg`,
    mapTarget: { x: 38, y: 50, rotation: -4 },
  },
  {
    id: 'salazie',
    name: 'Salazie',
    postalCode: '97433',
    color: 'var(--color-jungle-500)',
    image: `${STORAGE_BASE}/pack-de-10-stickers-salazie-97433/0.jpg`,
    mapTarget: { x: 50, y: 26, rotation: 3 },
  },
];

// Le magnet "974" du hero (premier magnet, couvre toute l'île)
export const heroMagnet = communes[0];

// Tous les magnets qui volent vers la carte
export const allMagnets = communes;
export const otherMagnets = communes;
