@AGENTS.md
@docs/design-brief.md

# Island Dreams — Refonte home narrative

> Site e-commerce de souvenirs illustrés de La Réunion (magnets, stickers, textile, décoration).
> Objectif : transformer la home actuelle (catalogue transactionnel) en **expérience narrative immersive** façon **livre d'histoire numérique**.

## Le projet en 30 secondes

**Site actuel :** [islanddreams.re](https://www.islanddreams.re/) — design épuré mais sans storytelling.

**Direction artistique validée :**
- Structure **inspirée de [Candia Columbus](https://www.candia.fr/columbus-candia/)** (blocs clairs, rythme, mascotte récurrente, ton décontracté)
- Style illustratif **inspiré Cheech & Chong's Apothecary** (cartoon bold, personnages qui émergent de la jungle)
- Ingrédients **livres enfants interactifs** (My Little Storybook, Hervé Tullet — micro-interactions tactiles, reconnaissance)
- Mascotte : **duo mémé créole + ti-marmaille**
- Typo titre : **Fraunces** (serif chunky 3D)
- Titre principal : **"L'ÎLE EN SOUVENIRS"** · sous-titre *"Un bout de péi à garder, à offrir."*

## L'animation signature

**Concept :** la mémé tient un gros magnet **974** au centre du hero. Au scroll, 11 mini-magnets (un par commune) sortent du 974, dessinent des courbes élégantes, et viennent se coller sur un frigo péi dans le bloc suivant.

**Implémentation :**
- GSAP + ScrollTrigger + MotionPath
- Liée au scroll via `scrub: 1` — l'utilisateur contrôle le tempo
- `stagger` de 0.05s entre chaque magnet
- Snap magnétique à l'arrivée + rotation aléatoire
- Le gros 974 flotte en permanence + suit la souris (parallaxe doux)

Voir `components/sections/FlyingMagnets.tsx` pour la logique complète.

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19**
- **TypeScript** strict
- **Tailwind CSS v4** (palette Island Dreams dans `app/globals.css` via `@theme`)
- **GSAP 3.15** (free plugins : ScrollTrigger, MotionPath)
- **Fraunces** (titres) + **Inter** (corps)

⚠️ Next.js 16 a des breaking changes — lire `node_modules/next/dist/docs/` avant d'écrire du code Next.js (voir AGENTS.md).

## Structure du code

```
app/
├─ layout.tsx           fonts (Fraunces + Inter) + metadata FR
├─ page.tsx             assemble Hero + FridgeCollection + FlyingMagnets
└─ globals.css          Tailwind v4 + palette + classe .title-chunky

components/
├─ sections/
│  ├─ Hero.tsx                 Bloc 1 — mémé + gros magnet 974 (client)
│  ├─ FridgeCollection.tsx     Bloc 2 — frigo avec cibles (server)
│  └─ FlyingMagnets.tsx        Animation GSAP du vol (client, portail body)
└─ ui/
   └─ Magnet.tsx               Magnet circulaire réutilisable (placeholder CSS)

lib/
├─ animations/gsap-setup.ts    Enregistrement plugins GSAP (singleton)
└─ data/communes.ts            12 communes : id, postalCode, color, mapPosition, fridgeTarget

public/
└─ images/                     À remplir avec les vraies illustrations
   ├─ hero/                    Illustration mémé + ti-marmaille + jungle
   ├─ fridge/                  Illustration frigo péi
   └─ magnets/                 PNG transparents des 12 magnets
```

## État actuel (ce qui est placeholder)

- [ ] **Illustration Hero** — actuellement un gradient vert. À remplacer par l'image Nano Banana (mémé + ti-marmaille + jungle, style Cheech & Chong, le titre sera superposé en CSS)
- [ ] **Illustration Frigo** — actuellement un rectangle blanc avec contour. À remplacer par l'image Nano Banana d'un frigo péi intégré dans une cuisine créole
- [ ] **Magnets** — actuellement rendus en CSS + SVG (`components/ui/Magnet.tsx`). À remplacer par les vrais PNG Island Dreams (un fichier par commune dans `public/images/magnets/`). Le composant `<Magnet />` devra basculer vers une `<Image>` Next/Image.
- [ ] **Positions des magnets sur le frigo** — à ajuster visuellement une fois le vrai frigo en place (`lib/data/communes.ts` → `fridgeTarget.x/y/rotation`)

## Les 9 blocs du plan narratif (inspirés Candia)

| # | Bloc | État |
|---|---|---|
| 1 | Hero — mémé + gros 974 + titre *L'ÎLE EN SOUVENIRS* | ✅ implémenté (placeholder visuel) |
| 2 | Collection frigo — *DANN NOUT KÈR* | ✅ implémenté (placeholder visuel) |
| 3 | Derrière l'illustration — savoir-faire | ⬜ à faire |
| 4 | Fait ici à La Réunion — carte + pictos | ⬜ à faire |
| 5 | Nos engagements péi | ⬜ à faire |
| 6 | Les occasions à offrir — capsules événements | ⬜ à faire |
| 7 | La boutique révélée — scène cliquable | ⬜ à faire |
| 8 | Ils en parlent — UGC + témoignages | ⬜ à faire |
| 9 | Footer narratif | ⬜ à faire |

Voir `docs/design-brief.md` pour le détail complet de chaque bloc.

## Conventions de code

- **Client components** : uniquement là où nécessaire (GSAP, interactions). Sinon server par défaut.
- **Paths** : alias `@/*` configuré. Importer via `@/components/...`, `@/lib/...`
- **Palette** : toujours via tokens Tailwind (`jungle-600`, `coral-500`, `sun-400`…), jamais de couleur hardcodée
- **Noir** : jamais `#000`. Utiliser `ink` (`#1a2e3b`) pour cohérence avec l'illustration
- **Créole vs français** : titres souvent créoles (*DANN NOUT KÈR*, *ZOT PÉI*), corps de texte en français, mélange assumé, jamais forcé/folklorisé
- **Animations GSAP** : toujours enregistrer plugins via `registerGsapPlugins()` de `@/lib/animations/gsap-setup`. Utiliser `gsap.context()` pour cleanup automatique. Au `return` du `useEffect`, `ctx.revert()`.
- **IDs signature** à ne pas renommer (l'animation les cible) :
  - `#hero-magnet-974` — gros magnet du hero
  - `#fridge-section` — section frigo (trigger ScrollTrigger)
  - `#fridge-door` — porte du frigo (parent des cibles)
  - `.flying-magnet` + `data-commune-id` — chaque mini-magnet animé
  - `.fridge-target` + `data-commune-id` — position cible correspondante

## Prochaines étapes prioritaires

1. **Intégrer les illustrations finales** (Hero + Frigo + magnets PNG)
2. **Ajuster les positions cibles des magnets** sur le frigo réel
3. **Construire le Bloc 3 — Derrière l'illustration** (carousel processus créatif : observer → photographier → croquer → illustrer → imprimer, avec DrawSVG au scroll)
4. **Ajouter un son "cling" magnétique** optionnel à l'atterrissage (désactivable)
5. **Bloc 4 — Fait ici** avec carte Réunion qui se dessine
6. Passer au **Club GreenSock** (~99$/an) pour SplitText + DrawSVG + ScrollSmoother

## Commandes

```bash
npm run dev      # dev server http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
```

## Références principales

- [Candia Columbus](https://www.candia.fr/columbus-candia/) — structure des blocs
- [My Little Storybook](https://www.awwwards.com/sites/my-little-storybook) — ambiance scrollytelling enfant
- [Hervé Tullet — livres interactifs](https://herve-tullet.com/tag/livre-interactif/) — micro-interactions
- [L'Affiche d'une Île](https://www.lafficheduneile.re/) — concurrent péi le plus proche
- Voir `docs/design-brief.md` pour la liste complète
