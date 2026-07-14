# QR codes partenaires

## Configuration

1. Dans **Admin → QR codes**, créer ou modifier un QR code.
2. Activer **QR partenaire / apporteur d’affaires**.
3. Renseigner le nom du gîte, l’email autorisé, le pourcentage de commission et la durée d’attribution.
4. Télécharger le PNG et le transmettre au partenaire.
5. Le gérant crée un compte avec exactement le même email, puis se connecte sur `/partenaire/connexion`.

## Attribution

- Le scan de `/q/[id]` incrémente les statistiques et pose un cookie HTTP-only.
- La dernière attribution partenaire est conservée pendant la durée configurée (30 jours par défaut).
- Les pages visitées sont comptabilisées sans stocker d’identité ni d’adresse IP.
- Au checkout, la campagne active est revalidée côté serveur avant d’être ajoutée aux métadonnées Stripe.
- Après `checkout.session.completed`, le webhook crée la commande et la commission.
- La commission porte sur le total payé hors livraison.
- Un événement Stripe `charge.refunded` annule une commission qui n’est pas déjà marquée comme payée.

## Autorisations

- `/admin` est réservé aux emails déclarés dans `ADMIN_EMAILS` (séparés par des virgules) ou `ADMIN_EMAIL`.
- `/partenaire` nécessite une session Supabase et ne montre que les campagnes associées à l’email connecté.
- Le service role reste exclusivement utilisé côté serveur.

## Paiement des commissions

Dans **Admin → QR codes → Ventes et commissions partenaires**, faire évoluer le statut :

- `pending` : paiement reçu, commission à contrôler ;
- `approved` : commission validée ;
- `paid` : commission réglée au partenaire ;
- `cancelled` : commande annulée ou remboursée.

Le webhook Stripe doit écouter `checkout.session.completed` et `charge.refunded`.
