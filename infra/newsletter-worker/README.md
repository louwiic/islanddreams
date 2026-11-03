# Planification des newsletters Island Dreams

## Utilisation

Dans **Newsletter → Campagnes**, préparer l’objet et le HTML, sélectionner
uniquement **Abonnés newsletter**, puis choisir une date dans **Planifier un envoi
automatique**. L’heure saisie est celle de La Réunion (UTC+4), quel que soit le
fuseau du navigateur. Le bouton affiche une confirmation avant de figer le contenu.

**Envois planifiés** affiche l’état du service, la dernière vérification, la date,
les prises en charge par Resend, les exclusions et les erreurs. Une campagne
encore planifiée peut être annulée. Après démarrage, elle n’est plus modifiable
ni annulable dans cette version. Les abonnés sont figés au premier passage après
la date choisie ; les désabonnements sont revérifiés avant chaque tentative.

## Installation sur le serveur

1. Dans le SQL Editor du projet PGBase Island Dreams, exécuter
   `scripts/pgbase/newsletter-queue.sql` en écriture avec le propriétaire du projet.
   Le script est réexécutable et ne crée ni campagne ni destinataire.
   Autre possibilité : `NEWSLETTER_DATABASE_URL` dans un environnement privé,
   puis `node scripts/pgbase/install-newsletter-queue.mjs` avec `psql` disponible.
2. Sur l’application web Coolify, conserver `PGBASE_URL`, `PGBASE_SECRET_KEY`,
   `RESEND_API_KEY` et `RESEND_FROM` déjà utilisés. Ajouter
   `NEWSLETTER_WORKER_SECRET` (au moins 32 caractères aléatoires, jamais NEXT_PUBLIC)
   et `NEWSLETTER_AUTOMATION_ENABLED=false` au runtime. Redéployer le site.
   La clé Resend doit permettre la lecture des contacts et l’envoi d’emails.
   Conserver aussi `RESEND_AUDIENCE_ID` si les anciennes campagnes l’utilisent.
3. Créer une application séparée sur le même dépôt, avec
   **Dockerfile = Dockerfile.newsletter-worker**. Aucun domaine ni port public.
   Variables du worker :
   - `NEWSLETTER_APP_URL=https://islanddreams.re`
   - `NEWSLETTER_WORKER_SECRET` : même valeur privée que sur le site
   - `NEWSLETTER_WORKER_DRY_RUN=true`
4. Déployer le worker avec une seule réplique. Son contrôle de santé vérifie un
   appel réussi dans les trois dernières minutes. L’écran de planification doit
   montrer un passage récent en simulation. Aucun email n’est envoyé dans ce mode.
5. Après recette et validation d’une première campagne, passer
   `NEWSLETTER_AUTOMATION_ENABLED=true` sur le site et
   `NEWSLETTER_WORKER_DRY_RUN=false` sur le worker, puis redéployer les deux.
   Laisser la file vide tant que les textes, destinataires et dates ne sont pas validés.

La signature des désinscriptions conserve la clé historique
`SUPABASE_SERVICE_ROLE_KEY` si elle existe ; sinon elle utilise
`NEWSLETTER_UNSUBSCRIBE_SECRET`, puis `PGBASE_SECRET_KEY`. Ne pas remplacer la clé
choisie après émission de liens sans prévoir une rotation compatible.

## Fonctionnement et limites

- La file et les checkpoints sont dans PostgreSQL, pas en mémoire ni dans le
  navigateur. Sauvegarder cette base avec le reste du projet.
- Le worker appelle un endpoint privé toutes les 15 secondes. Lui seul possède
  le secret ; il n’a pas besoin des clés de base ou Resend.
- Réservation atomique avec `FOR UPDATE SKIP LOCKED`, bail de deux minutes et
  jeton de réservation pour exclure les processus périmés.
- Au plus dix tentatives par passage, avec une temporisation entre les appels Resend.
  Les erreurs réseau / temporaires sont reprises avec un délai progressif.
- Les désabonnements sont vérifiés dans la base, puis sur le contact Resend et
  l’ancienne audience configurée. Un échec de cette vérification bloque l’envoi.
- Chaque destinataire possède une clé d’idempotence et un message figé. Un arrêt
  après acceptation par Resend peut rejouer la même requête sans doublonner
  pendant la fenêtre conservée par Resend.
- Cinq tentatives au maximum. Après 23 heures depuis la première tentative,
  aucun renvoi automatique : vérification manuelle, pour ne pas dépasser la
  conservation de 24 heures des clés chez Resend.
- Une acceptation Resend n’est pas une preuve de livraison ni d’ouverture.
  Les retours de livraison, rebonds et plaintes ne sont pas encore synchronisés
  par webhook dans cet écran. Resend reste le point de contrôle de délivrabilité.
- Les campagnes manuelles historiques restent distinctes. Cette version ne
  transforme pas automatiquement les messages de contact ou concours en abonnés.
- Les emails planifiés incluent une désinscription signée et les en-têtes
  `List-Unsubscribe` / `List-Unsubscribe-Post`. Le POST de désinscription reste
  valide sans connexion au site.
- Pour arrêter les prochains traitements : remettre les deux indicateurs à
  `false` / `true` respectivement, puis arrêter le worker. Une requête déjà
  acceptée par le fournisseur ne peut pas être rappelée.

## Recette sans envoi réel

Sur une base locale jetable `islanddreams_newsletter_test` uniquement :

```sh
NEWSLETTER_TEST_DSN=postgresql://newsletter_test@127.0.0.1:55438/islanddreams_newsletter_test npx tsx scripts/test-newsletter.ts
node --test scripts/test-newsletter-auth.cjs scripts/test-newsletter-sender.cjs scripts/test-newsletter-worker.cjs
npm run build
```

Les tests injectent un transport fictif et des adresses `.invalid`. Ils contrôlent
les dates, doublons, réservations, désabonnements tardifs, annulations, reprises
après interruption, message figé et expiration de l’idempotence. Aucun email réel.

Référence : https://resend.com/docs/dashboard/emails/idempotency-keys
