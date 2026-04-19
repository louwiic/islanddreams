# Import du catalogue WooCommerce

Workflow pour passer du catalogue WooCommerce actuel au catalogue Next.js du nouveau site, en deux étapes : **import des données** puis **téléchargement des images**.

## Étape 1 — Exporter le CSV depuis WooCommerce

1. Admin WordPress → **WooCommerce** → **Produits**
2. En haut de la liste produits : **Exporter**
3. Cocher **Exporter toutes les colonnes** et **Exporter tous les produits**
4. Laisser toutes les catégories sélectionnées
5. Cliquer **Générer le CSV**
6. Télécharger le fichier → déposer dans `scratch/woocommerce-export.csv` à la racine du projet

> 💡 Le CSV généré contient **toutes** les données produit : noms, prix, stocks, catégories, tags, attributs, URLs d'images, dates.

## Étape 2 — Installer les dépendances

Si tu ne l'as pas déjà fait après la dernière modif de `package.json` :

```bash
npm install
```

Deux nouvelles dépendances installées :
- `csv-parse` — parser CSV robuste
- `tsx` — runner TypeScript pour les scripts Node

## Étape 3 — Parser le CSV vers `lib/data/products.ts`

```bash
npm run import:products -- --input ./scratch/woocommerce-export.csv
```

Le script va :
1. Lire le CSV
2. Filtrer les variations WC (on garde les produits simples/parents)
3. Normaliser les catégories (magnets, stickers, textile, goodies, decoration)
4. Typer chaque produit selon `lib/types/product.ts`
5. Générer `lib/data/products.ts` avec tout le catalogue

**Output attendu en console :**
```
→ Lecture CSV : /chemin/export.csv
→ 142 lignes dans le CSV
→ 118 produits valides
→ Répartition par catégorie :
   - magnets : 45
   - stickers : 28
   - textile : 19
   - decoration : 16
   - goodies : 10
✓ Généré : lib/data/products.ts
```

## Étape 4 — Télécharger les images produit en local

Le CSV contient des URLs d'images hébergées sur ton WordPress. On les récupère localement pour servir le nouveau site :

```bash
npm run download:images
```

Le script va :
1. Lire `lib/data/products.ts`
2. Pour chaque produit, downloader chaque image depuis son URL WC
3. Ranger dans `public/images/products/[category]/[product-slug].[ext]`
4. Réécrire `products.ts` en ajoutant `localPath` à chaque image

**Exemple de sortie :**
```
[magnets] Magnet 974 Saint-Denis
   ✓ magnets/magnet-974-saint-denis.jpg

[stickers] Sticker Mafate
   ✓ stickers/sticker-mafate.jpg

=== Bilan ===
✓ Téléchargées : 126
⊙ Ignorées (déjà là) : 0
✗ Erreurs : 0
```

Les images déjà présentes ne sont pas retéléchargées — on peut rejouer le script sans souci.

## Étape 5 — Utiliser les produits dans l'app

```tsx
import {
  products,
  getProductsByCategory,
  getFeaturedProducts,
} from '@/lib/data/products';

// Tous les produits
products.forEach((p) => console.log(p.name));

// Par catégorie
const magnets = getProductsByCategory('magnets');

// Mis en avant
const featured = getFeaturedProducts();
```

Dans un composant, pour afficher une image :

```tsx
import Image from 'next/image';

<Image
  src={`/images/${product.images[0].localPath}`}
  alt={product.name}
  width={600}
  height={600}
/>
```

## Quand relancer l'import ?

À chaque fois que le catalogue WC bouge :
1. Nouveau produit ajouté / ancien supprimé
2. Prix ou stock modifié
3. Nouvelle photo produit

Il suffit de ré-exporter le CSV et de relancer les deux commandes. Les images déjà téléchargées ne sont pas re-récupérées.

## Troubleshooting

**"Impossible de parser lib/data/products.ts"**
→ Tu as lancé `download:images` avant `import:products`. Fais l'import d'abord.

**Colonnes CSV introuvables (Name, Categories, etc.)**
→ L'export WC est peut-être en français. Vérifie que tu as bien utilisé "Exporter toutes les colonnes" (noms anglais standards). Si le CSV est en français, adapte les clés dans `scripts/import-woocommerce-csv.ts` (`row.Name` → `row.Nom`, etc.).

**403 / 401 sur les images**
→ Ton WC a peut-être des restrictions hotlink. Passe en SFTP pour récupérer `/wp-content/uploads/` directement, ou ajoute un header `Referer` dans le script.

**Prix à zéro**
→ Le CSV WC utilise virgule ou point comme séparateur décimal selon la locale. Le script gère les deux, mais vérifie les premiers produits importés.

## Fichiers générés (ne pas éditer à la main)

- `lib/data/products.ts` — catalogue (regénéré à chaque `import:products`)
- `public/images/products/**/*.{jpg,png,webp}` — images locales

## Fichiers à ne jamais commiter dans Git

À ajouter dans `.gitignore` :
```
scratch/
```
(le CSV et les médias bruts restent locaux)
