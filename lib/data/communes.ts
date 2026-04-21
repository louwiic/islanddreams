// Données des communes de La Réunion
// Positions calibrées sur la carte illustrée (% relatifs à l'image)
// Images : visuels ronds des magnets depuis Supabase Storage

const MAGNETS = 'https://sgxilglkeupxpnzkzqfq.supabase.co/storage/v1/object/public/product-images/magnets-rond';

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
  // ── Nord (côte en haut, légèrement hors île ou sur le bord) ───────────
  {
    id: 'le-port',
    name: 'Le Port',
    postalCode: '97420',
    color: 'var(--color-sun-400)',
    image: `${MAGNETS}/le-port.webp`,
    mapTarget: { x: 10, y: 4, rotation: 5 },
  },
  {
    id: 'la-possession',
    name: 'La Possession',
    postalCode: '97419',
    color: 'var(--color-ocean-400)',
    image: `${MAGNETS}/la-possession.webp`,
    mapTarget: { x: 20, y: 2, rotation: -2 },
  },
  {
    id: 'saint-paul',
    name: 'Saint-Paul',
    postalCode: '97460',
    color: 'var(--color-ocean-600)',
    image: `${MAGNETS}/saint-paul.webp`,
    mapTarget: { x: 16, y: 27, rotation: 6 },
  },
  {
    id: 'saint-denis',
    name: 'Saint-Denis',
    postalCode: '97400',
    color: 'var(--color-ocean-500)',
    image: `${MAGNETS}/saint-denis.webp`,
    mapTarget: { x: 34, y: 13, rotation: -3 },
  },
  {
    id: 'sainte-marie',
    name: 'Sainte-Marie',
    postalCode: '97438',
    color: 'var(--color-jungle-400)',
    image: `${MAGNETS}/sainte-marie.webp`,
    mapTarget: { x: 56, y: 13, rotation: 4 },
  },
  {
    id: 'sainte-suzanne',
    name: 'Sainte-Suzanne',
    postalCode: '97441',
    color: 'var(--color-sun-400)',
    image: `${MAGNETS}/sainte-suzanne.webp`,
    mapTarget: { x: 66, y: 4, rotation: -2 },
  },
  {
    id: 'saint-andre',
    name: 'Saint-André',
    postalCode: '97440',
    color: 'var(--color-flamboyant)',
    image: `${MAGNETS}/saint-andre.webp`,
    mapTarget: { x: 80, y: 8, rotation: 5 },
  },
  // ── Est ──────────────────────────────────────────────────────────────
  {
    id: 'bras-panon',
    name: 'Bras-Panon',
    postalCode: '97412',
    color: 'var(--color-sun-300)',
    image: `${MAGNETS}/bras-panon.webp`,
    mapTarget: { x: 90, y: 18, rotation: -4 },
  },
  {
    id: 'sainte-anne',
    name: 'Sainte-Anne',
    postalCode: '97470',
    color: 'var(--color-ocean-400)',
    image: `${MAGNETS}/saint-benoit-anne.webp`,
    mapTarget: { x: 95, y: 30, rotation: -2 },
  },
  {
    id: 'saint-benoit',
    name: 'Saint-Benoît',
    postalCode: '97437',
    color: 'var(--color-flamboyant)',
    image: `${MAGNETS}/saint-benoit.webp`,
    mapTarget: { x: 82, y: 34, rotation: 3 },
  },
  {
    id: 'saint-philippe',
    name: 'Saint-Philippe',
    postalCode: '97442',
    color: 'var(--color-coral-500)',
    image: `${MAGNETS}/saint-philippe.webp`,
    mapTarget: { x: 79, y: 68, rotation: -3 },
  },
  // ── Sud ──────────────────────────────────────────────────────────────
  {
    id: 'saint-joseph',
    name: 'Saint-Joseph',
    postalCode: '97480',
    color: 'var(--color-coral-400)',
    image: `${MAGNETS}/saint-joseph.webp`,
    mapTarget: { x: 61, y: 82, rotation: 4 },
  },
  {
    id: 'petite-ile',
    name: 'Petite-Île',
    postalCode: '97429',
    color: 'var(--color-coral-300)',
    image: `${MAGNETS}/petite-ile.webp`,
    mapTarget: { x: 50, y: 86, rotation: -5 },
  },
  {
    id: 'saint-pierre',
    name: 'Saint-Pierre',
    postalCode: '97410',
    color: 'var(--color-coral-500)',
    image: `${MAGNETS}/saint-pierre.webp`,
    mapTarget: { x: 37, y: 81, rotation: 6 },
  },
  {
    id: 'etang-sale',
    name: 'Étang-Salé',
    postalCode: '97427',
    color: 'var(--color-bougainvillea)',
    image: `${MAGNETS}/etang-sale.webp`,
    mapTarget: { x: 28, y: 90, rotation: 5 },
  },
  // ── Ouest ────────────────────────────────────────────────────────────
  {
    id: 'saint-louis',
    name: 'Saint-Louis',
    postalCode: '97450',
    color: 'var(--color-coral-600)',
    image: `${MAGNETS}/saint-louis.webp`,
    mapTarget: { x: 16, y: 78, rotation: -4 },
  },
  {
    id: 'les-avirons',
    name: 'Les Avirons',
    postalCode: '97425',
    color: 'var(--color-bougainvillea)',
    image: `${MAGNETS}/les-avirons.webp`,
    mapTarget: { x: 6, y: 66, rotation: -6 },
  },
  {
    id: 'saint-leu',
    name: 'Saint-Leu',
    postalCode: '97436',
    color: 'var(--color-bougainvillea)',
    image: `${MAGNETS}/saint-leu.webp`,
    mapTarget: { x: 14, y: 52, rotation: 4 },
  },
  {
    id: 'trois-bassins',
    name: 'Trois-Bassins',
    postalCode: '97426',
    color: 'var(--color-ocean-500)',
    image: `${MAGNETS}/trois-bassins.webp`,
    mapTarget: { x: 4, y: 40, rotation: -3 },
  },
  {
    id: 'saint-gilles',
    name: 'Saint-Gilles',
    postalCode: '97434',
    color: 'var(--color-ocean-300)',
    image: `${MAGNETS}/saint-gilles.webp`,
    mapTarget: { x: 6, y: 30, rotation: 4 },
  },
  // ── Cirques & Intérieur (sur l'île) ──────────────────────────────────
  {
    id: 'mafate',
    name: 'Mafate',
    postalCode: '97419',
    color: 'var(--color-jungle-400)',
    image: `${MAGNETS}/mafate.webp`,
    mapTarget: { x: 30, y: 30, rotation: -3 },
  },
  {
    id: 'salazie',
    name: 'Salazie',
    postalCode: '97433',
    color: 'var(--color-jungle-500)',
    image: `${MAGNETS}/salazie.webp`,
    mapTarget: { x: 52, y: 28, rotation: 3 },
  },
  {
    id: 'cilaos',
    name: 'Cilaos',
    postalCode: '97413',
    color: 'var(--color-jungle-600)',
    image: `${MAGNETS}/cilaos.webp`,
    mapTarget: { x: 37, y: 54, rotation: -4 },
  },
  {
    id: 'entre-deux',
    name: 'Entre-Deux',
    postalCode: '97414',
    color: 'var(--color-ocean-400)',
    image: `${MAGNETS}/entre-deux.webp`,
    mapTarget: { x: 46, y: 64, rotation: 3 },
  },
  {
    id: 'le-tampon',
    name: 'Le Tampon',
    postalCode: '97430',
    color: 'var(--color-jungle-500)',
    image: `${MAGNETS}/le-tampon.webp`,
    mapTarget: { x: 58, y: 62, rotation: -2 },
  },
];

// Le magnet "974" du hero
export const heroMagnet = communes[0];

// Tous les magnets (usage admin / carousel)
export const allMagnets = communes;
export const otherMagnets = communes;

// Magnets affichés sur la carte — 2 par zone cardinale + Cilaos
const MAP_IDS = [
  // Nord
  'saint-denis',
  'sainte-marie',
  // Est
  'saint-benoit',
  'saint-philippe',
  // Sud
  'saint-pierre',
  'saint-joseph',
  // Ouest
  'saint-paul',
  'saint-leu',
  // Centre
  'cilaos',
];

export const mapMagnets = communes.filter((c) => MAP_IDS.includes(c.id));
