# Island Dreams — L'île en souvenirs

Refonte de la home **islanddreams.re** pensée comme un **livre d'histoire numérique** autour de l'identité péi. Inspiration visuelle : structure [Candia Columbus](https://www.candia.fr/columbus-candia/) + style illustratif Cheech & Chong's Apothecary + esprit livre enfant interactif.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4** (palette Island Dreams dans `app/globals.css`)
- **GSAP** + ScrollTrigger + MotionPath (animations scroll + vol magnétique)
- **Fraunces** (titres) + **Inter** (corps)

## Démarrage

```bash
npm install        # si pas déjà fait
npm run dev        # http://localhost:3000
npm run build      # build production
```

## Structure

```
app/
├─ layout.tsx           Fonts + metadata
├─ page.tsx             Assemble les sections
└─ globals.css          Tailwind v4 + palette + tokens

components/
├─ sections/
│  ├─ Hero.tsx                 Bloc 1 — mémé + gros magnet 974
│  ├─ FridgeCollection.tsx     Bloc 2 — le frigo qui se remplit
│  └─ FlyingMagnets.tsx        Orchestration des magnets volants
└─ ui/
   └─ Magnet.tsx               Composant magnet circulaire

lib/
├─ animations/
│  └─ gsap-setup.ts      Enregistrement plugins GSAP
└─ data/
   └─ communes.ts        Les 12 magnets (codes postaux, couleurs, positions)

public/
└─ images/               Assets finaux (hero, fridge, magnets PNG)
```

## L'animation signature

Quand l'utilisateur scrolle du Hero vers le Frigo :

1. Le **gros magnet 974** flotte au centre et suit légèrement la souris (parallaxe doux)
2. Au scroll, **11 mini-magnets** (un par commune) sortent du 974
3. Chacun suit une **trajectoire courbe** (MotionPath) vers sa position cible sur le frigo
4. À l'arrivée : petit **snap magnétique** (scale bounce) et légère rotation aléatoire

Liée au scroll via `ScrollTrigger` avec `scrub: 1` — l'animation est pilotée par la progression du scroll, pas par le temps. L'utilisateur contrôle le tempo.

## À venir

- [ ] Remplacer les placeholders par les illustrations Nano Banana (hero + frigo)
- [ ] Remplacer les magnets CSS par les vrais PNG Island Dreams
- [ ] Bloc 3 — Derrière l'illustration (savoir-faire)
- [ ] Bloc 4 — Fait ici à La Réunion
- [ ] Bloc 5 — Nos engagements
- [ ] Bloc 6 — Les occasions à offrir
- [ ] Bloc 7 — La boutique révélée
- [ ] Bloc 8 — Ils en parlent
- [ ] Bloc 9 — Footer
- [ ] Son optionnel (cling magnétique)
- [ ] Passer aux plugins Club GreenSock (SplitText, DrawSVG, ScrollSmoother)

## Palette (tokens Tailwind v4)

| Token | Usage |
|---|---|
| `jungle-{50..900}` | Verts de jungle Réunion |
| `coral-{50..700}` | Rouges hibiscus / flamboyant |
| `sun-{50..600}` | Jaunes soleil / 974 |
| `ocean-{50..700}` | Bleus lagon |
| `bougainvillea` | Violet fuchsia |
| `flamboyant` | Orange flamboyant |
| `cream` | Fond crème doux |
| `ink` | Noir bleuté (jamais pur noir) |

## Commandes utiles

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
```
