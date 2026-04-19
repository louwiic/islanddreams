// Données des communes Island Dreams
// Chaque magnet correspond à une commune de La Réunion

export type Commune = {
  id: string;
  name: string;
  postalCode: string;
  color: string;
  // Position sur la carte illustrée (pourcentages relatifs à l'image)
  mapTarget: { x: number; y: number; rotation: number };
};

export const communes: Commune[] = [
  {
    id: 'saint-denis',
    name: 'Saint-Denis',
    postalCode: '974',
    color: 'var(--color-sun-400)',
    mapTarget: { x: 44, y: 4, rotation: 0 },
  },
  {
    id: 'saint-paul',
    name: 'Saint-Paul',
    postalCode: '438',
    color: 'var(--color-coral-500)',
    mapTarget: { x: 18, y: 34, rotation: -8 },
  },
  {
    id: 'le-port',
    name: 'Le Port',
    postalCode: '420',
    color: 'var(--color-sun-300)',
    mapTarget: { x: 23, y: 13, rotation: 5 },
  },
  {
    id: 'saint-leu',
    name: 'Saint-Leu',
    postalCode: '436',
    color: 'var(--color-ocean-500)',
    mapTarget: { x: 20, y: 60, rotation: 10 },
  },
  {
    id: 'les-avirons',
    name: 'Les Avirons',
    postalCode: '425',
    color: 'var(--color-bougainvillea)',
    mapTarget: { x: 26, y: 68, rotation: -5 },
  },
  {
    id: 'saint-pierre',
    name: 'Saint-Pierre',
    postalCode: '410',
    color: 'var(--color-flamboyant)',
    mapTarget: { x: 42, y: 88, rotation: 15 },
  },
  {
    id: 'petite-ile',
    name: 'Petite-Île',
    postalCode: '429',
    color: 'var(--color-ocean-300)',
    mapTarget: { x: 58, y: 90, rotation: -12 },
  },
  {
    id: 'saint-joseph',
    name: 'Saint-Joseph',
    postalCode: '435',
    color: 'var(--color-jungle-400)',
    mapTarget: { x: 56, y: 96, rotation: 8 },
  },
  {
    id: 'saint-philippe',
    name: 'Saint-Philippe',
    postalCode: '432',
    color: 'var(--color-coral-400)',
    mapTarget: { x: 78, y: 90, rotation: -3 },
  },
  {
    id: 'saint-benoit',
    name: 'Saint-Benoît',
    postalCode: '437',
    color: 'var(--color-jungle-500)',
    mapTarget: { x: 76, y: 34, rotation: 6 },
  },
  {
    id: 'plaines-des-palmistes',
    name: 'Plaine des Palmistes',
    postalCode: '440',
    color: 'var(--color-flamboyant)',
    mapTarget: { x: 70, y: 50, rotation: -10 },
  },
  {
    id: 'salazie',
    name: 'Salazie',
    postalCode: '433',
    color: 'var(--color-jungle-600)',
    mapTarget: { x: 56, y: 26, rotation: 4 },
  },
];

export const heroMagnet = communes[0];
export const otherMagnets = communes.slice(1);
