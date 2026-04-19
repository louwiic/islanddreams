# Island Dreams — Organisation des médias

Structure des assets visuels pour le site. **Tous les fichiers doivent être optimisés web** (WebP en priorité, PNG/JPG si transparence ou qualité critique).

## Structure des dossiers

```
public/images/
├─ hero/            Illustrations du hero (mémé + marmaille, île trésor, etc.)
├─ fridge/          Illustrations du bloc frigo (frigo péi, cuisine créole)
├─ map/             Illustrations de la carte Réunion (vue globale, lianes, etc.)
├─ magnets/         Les 12 magnets PNG (un par commune, fond transparent)
├─ communes/        Photos ou illustrations par commune (usage éditorial)
├─ products/        Photos produits pour la boutique
│  ├─ magnets/
│  ├─ stickers/
│  ├─ textile/
│  ├─ goodies/
│  └─ decoration/
├─ brand/           Logos, marques, identité graphique
├─ logo/            Variantes du logo Island Dreams (sombre/clair/favicons)
├─ decor/           Éléments décoratifs réutilisables (fleurs, feuilles, motifs)
├─ press/           Logos presse / blogs / partenaires
├─ ugc/             Photos clients / Instagram / témoignages
└─ scratch/         Sas temporaire pour tri / médias en attente de classement
```

## Convention de nommage

**Règle générale :** `[contexte]-[sujet]-[variante].[ext]`
- Tout en **kebab-case** (minuscules, tirets, pas d'espaces, pas d'accents)
- Pas de majuscules, pas d'underscores
- Descriptif mais court

### Exemples par catégorie

**Hero**
```
hero-meme-marmaille.webp
hero-ile-tresor.webp
hero-meme-shaka.webp
```

**Fridge**
```
fridge-cuisine-creole.webp
fridge-empty.webp
fridge-full-collection.webp
```

**Magnets** (un fichier par commune, fond transparent)
```
magnet-974-saint-denis.png
magnet-438-saint-paul.png
magnet-420-le-port.png
magnet-436-saint-leu.png
magnet-425-les-avirons.png
magnet-410-saint-pierre.png
magnet-429-petite-ile.png
magnet-435-saint-joseph.png
magnet-432-saint-philippe.png
magnet-437-saint-benoit.png
magnet-440-plaines-des-palmistes.png
magnet-433-salazie.png
```

**Products**
```
products/magnets/magnet-974-pack-face.webp
products/magnets/magnet-974-pack-contexte.webp
products/textile/tshirt-kartie-pei-noir-face.webp
products/decoration/affiche-piton-fournaise-a3.webp
```

**Brand / Logo**
```
brand/logo-color.svg
brand/logo-white.svg
brand/logo-mark.svg
logo/favicon-32.png
logo/apple-touch-icon.png
```

**Decor** (éléments réutilisables)
```
decor/flower-hibiscus-red.svg
decor/flower-flamboyant-orange.svg
decor/leaf-monstera-large.svg
decor/vine-corner.svg
```

## Optimisation — checklist

Avant de commit un asset :

- [ ] **Format** : WebP pour photos/illustrations, SVG pour icônes/vecteurs, PNG si transparence nécessaire
- [ ] **Poids** : < 200 KB pour un hero, < 50 KB pour une vignette produit, < 20 KB pour un magnet
- [ ] **Dimensions** : hero 2560×1440 max, produits 1200×1200 max, magnets 400×400 max
- [ ] **Nom de fichier** : respecte la convention kebab-case
- [ ] **Retina** : fournir des versions @2x si nécessaire (géré auto par Next/Image dans la plupart des cas)

## Workflow import depuis WordPress

1. Télécharger `/wp-content/uploads/` via SFTP dans `scratch/wp-uploads-raw/`
2. Trier par usage dans les dossiers appropriés
3. Renommer selon la convention
4. Optimiser (WebP, compression)
5. Supprimer `scratch/wp-uploads-raw/` une fois le tri terminé

## Outils recommandés

- **Squoosh** ([squoosh.app](https://squoosh.app)) — conversion WebP/compression côté navigateur
- **ImageOptim** (Mac) — batch optimization
- **svgo** — optimisation SVG en CLI : `npx svgo decor/*.svg`
- **sharp** (Node) — si on veut automatiser en CI
