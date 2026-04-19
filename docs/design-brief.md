# Island Dreams — Design Brief

> Document de référence design & narratif pour la refonte de la home.

## 1. Contexte client

- **Marque :** Island Dreams
- **Site actuel :** [islanddreams.re](https://www.islanddreams.re/)
- **Activité :** Objets souvenirs illustrés (magnets, stickers, textile, goodies, décoration) autour de l'identité réunionnaise
- **Accroche actuelle :** *"Zot vil, zot fiérté peï"*
- **Diagnostic :** site catalogue classique, pas de storytelling, pas de mise en avant événementielle, pas de blog, pas d'UGC

## 2. Direction artistique validée

**Modèle structurel :** [Candia Columbus](https://www.candia.fr/columbus-candia/)
- Blocs clairs et rythmés (promesse → univers → savoir-faire → valeurs → action → preuve)
- Mascotte récurrente
- Mix de langues assumé
- Ton décontracté mais soigné
- Couleur signature forte
- Illustrations stylisées

**Style illustratif :** Cheech & Chong's Apothecary (cartoon bold avec personnages qui émergent de la végétation tropicale, typo 3D chunky)

**Ingrédients narratifs (livres enfants interactifs) :**
- Personnage récurrent traversant les "pages" (la mascotte)
- Micro-interactions tactiles (Hervé Tullet)
- Narration à la 2e personne (*"regarde, écoute…"*)
- Reconnaissance émotionnelle (*"ça, c'est chez moi"*)
- Surprises cachées qui se révèlent au scroll

## 3. Identité visuelle

### Mascotte
**Duo : mémé créole + ti-marmaille**
- La mémé : 60 ans, peau brun chaud, cheveux poivre et sel chignon, hibiscus rouge derrière l'oreille, top blanc à broderies florales
- Le ti-marmaille : 6-8 ans, cheveux bouclés bruns, t-shirt tropical multicolore
- Pose signature : la mémé fait le shaka 🤙 ou tient un magnet
- Apparaissent dans la jungle péi (flamboyant, hibiscus, bougainvillée, monstera, vacoa)

### Palette (tokens Tailwind)
- `jungle-{50..900}` — verts dominants (~55%)
- `coral-{50..700}` — hibiscus, accents chauds
- `sun-{50..600}` — jaune 974, soleil
- `ocean-{50..700}` — bleu lagon
- `bougainvillea` (#b14ea8) — violet
- `flamboyant` (#ff6b2c) — orange
- `cream` (#f5efe0) — fond doux
- `ink` (#1a2e3b) — noir bleuté (jamais #000)

### Typographie
- **Titres** : Fraunces (serif chunky 3D), classe `.title-chunky` avec gradient jaune + outline noir + shadow coral
- **Corps** : Inter (sans-serif neutre)
- **Script (optionnel)** : Caveat (manuscrit pour notes, sous-titres tendres)

### Ton éditorial
- Mélange français-créole assumé
- **Titres en créole**, corps en français
- Pas de folklorisation, pas de "péi" toutes les 3 lignes
- Tendresse intergénérationnelle, pas mièvre
- Pas d'emoji intempestif, pas d'exclamations à outrance

## 4. Les 9 blocs (mapping Candia → Island Dreams)

| # | Candia | Island Dreams | Rôle | Animation phare |
|---|---|---|---|---|
| 1 | Hero promesse | Hero — *L'ÎLE EN SOUVENIRS* | Accroche | Magnet 974 flottant + parallaxe souris |
| 2 | Galerie 5 lattes | Frigo — *DANN NOUT KÈR* | Univers | 11 mini-magnets volent du hero vers le frigo |
| 3 | Cold brew process | Derrière l'illustration | Savoir-faire | DrawSVG du parcours créatif au scroll |
| 4 | Production française | Fait ici à La Réunion | Valeurs | Carte Réunion qui se dessine, point pulsant atelier |
| 5 | Packaging responsable | Nos engagements péi | Réassurance | Cards en cascade |
| 6 | — | Les occasions à offrir | Émotion | Capsules saisonnières (fête mères, 20 Désanm…) |
| 7 | Où acheter | La boutique révélée | Conversion | Scène intérieur créole avec objets cliquables |
| 8 | Presse | Ils en parlent / UGC | Preuve | Carrousel témoignages + photos clients |
| 9 | Footer | Footer narratif | Sortie | Newsletter *Kréol mail*, mascotte coucou |

### Détail Bloc 1 — Hero
- Fond : illustration mémé + ti-marmaille dans jungle péi
- Titre 3D chunky : **L'ÎLE EN SOUVENIRS**
- Sous-titre script doré : *"Un bout de péi à garder, à offrir."*
- Label : *Island Dreams · 974*
- **Gros magnet 974 central** flottant (parallaxe souris)
- Indicateur de scroll animé

### Détail Bloc 2 — Collection frigo
- Frigo péi (vintage, dans cuisine créole)
- 11 magnets volent du 974 du hero pour s'y coller
- Titre : **DANN NOUT KÈR**
- Sous-titre : *"Chaque commune trouve sa place sur le frigo familial."*
- Au scroll : magnets atterrissent un à un avec snap magnétique

### Détail Bloc 3 — Derrière l'illustration
- Schéma : observer → photographier → croquer → illustrer → imprimer
- DrawSVG qui trace le parcours au scroll
- Binômes photo réelle ↔ illustration finale

### Détail Bloc 4 — Fait ici
- Carte stylisée de La Réunion qui se dessine au scroll
- Point pulsant sur l'atelier
- 3 pictos : Dessiné · Imprimé · Pensé péi

### Détail Bloc 6 — Occasions
Capsules tournantes selon le calendrier :
- 💐 Fête des mères (mai)
- 👔 Fête des pères (juin)
- 🔥 **20 Désanm / Fèt Kaf** (20 décembre — capsule la plus importante)
- 🎄 Noël péi
- 🎒 Rentrée scolaire
- 💌 Saint-Valentin

## 5. Mécanique d'animation signature

**L'idée :** le 974 (La Réunion) "explose" en ses communes qui trouvent chacune leur place sur le frigo familial.

**Le ressenti utilisateur :**
1. Arrivée → gros 974 capte l'œil, bouge légèrement avec la souris
2. Premier scroll → un mini-magnet sort, dessine une courbe, atterrit avec un bounce
3. Scroll continue → les magnets sortent un à un
4. Bloc frigo → la collection est complète, la mémé "a rangé l'île"
5. **L'utilisateur a construit la collection en scrollant.** Il comprend le produit sans qu'on ait expliqué.

**Détails à ajouter (futures itérations) :**
- Son "cling" magnétique discret désactivable
- Trails légers (traînées de couleur) pendant le vol
- Effet "confetti" final quand tous les magnets sont collés
- Sparkle SVG sur chaque atterrissage

## 6. Workflow illustrations Nano Banana

Pour générer les visuels (mémé+ti-marmaille, frigo, etc.) :
1. Toujours uploader 2 références : style (Cheech & Chong) + produit (vrais magnets Island Dreams)
2. Demander explicitement de **NE PAS** mettre le titre dans l'image (il sera en CSS)
3. Pour les magnets identiques au pixel près : générer la scène avec **placeholders blancs**, puis **compositer les vrais PNG** en post-prod (Photoshop / Figma)
4. Toujours demander 16:9 landscape, qualité hero web

## 7. Références à étudier

### Structure & narration
- [Candia Columbus](https://www.candia.fr/columbus-candia/) — référence principale
- [My Little Storybook](https://www.awwwards.com/sites/my-little-storybook) — Awwwards SOTD, Three.js
- [Hervé Tullet — livres interactifs](https://herve-tullet.com/tag/livre-interactif/) — interactions tactiles
- [The Boat – SBS](http://www.sbs.com.au/theboat/) — scroll narratif illustré
- [NYT Snow Fall](https://www.nytimes.com/projects/2012/snow-fall/) — pionnier scrollytelling

### Concurrence péi
- [L'Affiche d'une Île](https://www.lafficheduneile.re/) — le plus proche
- [Zed-World](https://www.zed-world.com/) — illustrations Rotring
- [ARTmaZone](https://artmazone-creation974.fr/) — plateforme créateurs locaux

## 8. Décisions à trancher avec le client

- [ ] Couleur signature dominante (terre rouge / bleu lagon / vert canne ?)
- [ ] Budget Club GreenSock (~99$/an pour SplitText, DrawSVG, ScrollSmoother)
- [ ] Audio activable ou pas du tout ?
- [ ] Dosage créole/français exact (70/30 ? 50/50 ?)
- [ ] CMS final (WordPress ? Headless CMS ? Statique ?)

## 9. Données produit (12 communes)

Voir `lib/data/communes.ts` pour la source de vérité. Format type :
```ts
{
  id: 'saint-denis',
  name: 'Saint-Denis',
  postalCode: '974',
  color: 'var(--color-sun-400)',
  mapPosition: { x: 50, y: 8 },        // % sur la carte Réunion
  fridgeTarget: { x: 50, y: 18, rotation: 0 },  // % sur le frigo
}
```
