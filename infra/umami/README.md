# Umami — Island Dreams

## Installation

- Serveur Coolify : `137.74.171.48`.
- Service créé : `znaumopmunlivp9o8nxknhki` dans le projet Island Dreams.
- Image Umami 3.4.1 verrouillée par son digest ; PostgreSQL 16 dédié.
- PostgreSQL utilise un volume persistant sans port publié sur le serveur.
- Les secrets PostgreSQL, applicatif et de chiffrement 2FA sont générés par Coolify.
- La télémétrie vers l'éditeur est désactivée.

Le fichier `docker-compose.coolify.yml` est destiné au parseur des Service Stacks
Coolify : ses variables `SERVICE_*` ne sont pas des secrets à remplir dans Git.

## Accès et suivi

- Interface : https://stats.islanddreams.re
- Site Island Dreams : `a4f29bdf-1dce-4736-8274-282bf4ffa55d` (identifiant public).
- Contrôle de santé HTTPS `/api/heartbeat` : HTTP 200 le 31 octobre 2026.
- Premier événement technique `installation_check` accepté par `/api/send`.
- Sauvegarde PostgreSQL quotidienne à 02:29 UTC, tâche
  `vhuvqjicdfw7mgpu8thgwx9a` ; première exécution réussie (64,74 Ko).
  Les copies restent sur le serveur ; aucun stockage S3 n'est configuré.
- Le propriétaire doit remplacer le mot de passe administrateur initial dans
  **Settings → Profile → Change password** avant de partager l'accès.

Variables publiques configurées dans Coolify pour le site (build et runtime) :

```dotenv
NEXT_PUBLIC_ANALYTICS_PROVIDER=umami
NEXT_PUBLIC_UMAMI_URL=https://stats.islanddreams.re
NEXT_PUBLIC_UMAMI_WEBSITE_ID=a4f29bdf-1dce-4736-8274-282bf4ffa55d
```

Le module historique `lib/analytics/plausible.ts` garde son API `track` pour les
composants existants, mais envoie uniquement vers Umami lorsque ce fournisseur est
sélectionné. L'absence de configuration Umami ne provoque pas de repli vers un
autre collecteur. Le script Plausible externe a été retiré du layout.

Les pages vues et événements existants démarrent après consentement. Le suivi
exclut les espaces privés et les hôtes de développement, respecte GPC et retire
les paramètres, fragments et propriétés libres pouvant contenir des données
personnelles. Les pages vues utilisent un événement Umami sans nom ; les actions
utilisent un événement nommé. L'historique Plausible reste dans sa propre base.

Validation : `node --test scripts/test-analytics.cjs` et `npm run build`.
Le raccordement initial a été déployé avec le commit `624b5ac`. Les paramètres
publics ont été vérifiés dans le JavaScript servi par Cloudflare. Le sous-domaine
`stats.islanddreams.re` possède un enregistrement A Cloudflare proxifié vers
`137.74.171.48` et un certificat HTTPS valide également sur le serveur origine.
L'ancienne adresse sslip.io reste accessible pour la compatibilité des pages
déjà ouvertes. Aucun changement de base de données ni d'identifiant de site.

Le volume persistant préserve les données lors d'un redéploiement ; il ne remplace
pas une sauvegarde. Ne pas supprimer les volumes lors d'une mise à jour.

Sources : [installation](https://docs.umami.is/docs/install),
[variables](https://docs.umami.is/docs/environment-variables),
[version 3.4.1](https://github.com/umami-software/umami/releases/tag/v3.4.1).
