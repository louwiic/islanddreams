# Islanddreams sur PGBase

Configuration serveur requise (locale privée et Vercel Production) :
`PGBASE_URL`, `PGBASE_PUBLISHABLE_KEY` (scope auth uniquement), `PGBASE_SECRET_KEY`.
Aucune de ces clés ne doit être publiée dans Git ou sous une variable NEXT_PUBLIC.

Après une restauration de base, exécuter `site-query.sql` dans le SQL Editor PGBase en mode écriture. Le site utilise ensuite `/rpc/islanddreams_query` avec la clé serveur. La fonction reste SECURITY INVOKER, sans droit EXECUTE pour les visiteurs ; elle applique les rôles PostgreSQL et les claims vérifiés côté serveur pour conserver la RLS.

`@supabase/supabase-js` conserve uniquement les types et la syntaxe des requêtes existantes. Les données, l’authentification et les fichiers sont servis par PGBase. Les sessions utilisent des cookies HttpOnly.

Les anciens liens Storage sont convertis à la lecture en `/media/supabase/...`. Les copies locales vérifiées restent disponibles ; les fichiers manquants affichent une image d’attente. Copier les fichiers manquants dans les mêmes buckets et chemins PGBase suffit pour les rendre accessibles. L’écriture conserve les liens source afin de préserver leurs références.

Le relais SMTP du projet et les modèles de vérification/réinitialisation se configurent dans Authentification → E-mails. Le lien de réinitialisation doit viser `https://www.islanddreams.re/compte/nouveau-mot-de-passe?token={{ .ActionURL }}` lorsque le serveur PGBase fournit le jeton brut.

Vérifications : `npm run build`, `npx tsx scripts/pgbase/test-query.ts`, `node scripts/test-shipping.cjs`. Pour tester les droits et écritures sans toucher à la production : `PGBASE_TEST_DSN` doit viser une copie locale jetable nommée `islanddreams_adapter` ; les opérations de test sont annulées.

Les exports contenant les données clients, dumps et fichiers de connexion restent dans le dossier privé extérieur au dépôt. `rebuild-gui-export.py` est réservé à une base locale vide de récupération.
