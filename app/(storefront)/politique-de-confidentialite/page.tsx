import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de confidentialité — Island Dreams 974',
  description: 'Politique de confidentialité du site Island Dreams.',
  alternates: { canonical: '/politique-de-confidentialite' },
};

export default function PolitiqueConfidentialitePage() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-10">
        <h1
          className="text-center text-cream text-3xl md:text-4xl font-black uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Politique de confidentialité
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-sm prose-ink legal-prose">
        <p className="text-ink/60 italic">Dernière mise à jour : mai 2026</p>

        <h2>1. Responsable du traitement</h2>
        <p>
          Le responsable du traitement des données collectées sur le site islanddreams.re est :
        </p>
        <address className="not-italic">
          <strong>ISLAND DREAMS</strong><br />
          26 RUE CAFRES — 97414 ENTRE-DEUX<br />
          La Réunion<br />
          contact@islanddreams.re — 0693 05 66 67
        </address>

        <h2>2. Données collectées</h2>
        <p>
          Nous collectons les données personnelles suivantes dans le cadre de l&apos;utilisation de
          notre site et de nos services :
        </p>
        <ul>
          <li>
            <strong>Données d&apos;identification</strong> : nom, prénom, adresse email, numéro de
            téléphone.
          </li>
          <li>
            <strong>Données de livraison</strong> : adresse postale complète.
          </li>
          <li>
            <strong>Données de commande</strong> : produits commandés, montants, historique
            d&apos;achat.
          </li>
          <li>
            <strong>Données de navigation</strong> : cookies techniques et fonctionnels (voir notre{' '}
            <a href="/politique-de-cookies">Politique de cookies</a>).
          </li>
          <li>
            <strong>Données de contact</strong> : messages envoyés via le formulaire de contact.
          </li>
          <li>
            <strong>Newsletter</strong> : adresse email si vous vous inscrivez à notre newsletter.
          </li>
        </ul>

        <h2>3. Finalités du traitement</h2>
        <p>Vos données personnelles sont traitées pour les finalités suivantes :</p>
        <ul>
          <li>Gestion des commandes et livraisons</li>
          <li>Gestion de la relation client et du service après-vente</li>
          <li>Envoi de la newsletter (avec votre consentement)</li>
          <li>Réponse à vos demandes de contact</li>
          <li>Amélioration de nos services et de l&apos;expérience utilisateur</li>
          <li>Respect de nos obligations légales et réglementaires</li>
        </ul>

        <h2>4. Base légale du traitement</h2>
        <p>Le traitement de vos données repose sur :</p>
        <ul>
          <li>
            <strong>L&apos;exécution du contrat</strong> : pour le traitement de vos commandes.
          </li>
          <li>
            <strong>Votre consentement</strong> : pour l&apos;envoi de la newsletter et les cookies
            non essentiels.
          </li>
          <li>
            <strong>L&apos;intérêt légitime</strong> : pour l&apos;amélioration de nos services.
          </li>
          <li>
            <strong>L&apos;obligation légale</strong> : pour la conservation des factures et données
            comptables.
          </li>
        </ul>

        <h2>5. Destinataires des données</h2>
        <p>Vos données peuvent être transmises aux prestataires suivants :</p>
        <ul>
          <li><strong>Stripe</strong> : traitement sécurisé des paiements</li>
          <li><strong>Supabase</strong> : hébergement de la base de données</li>
          <li><strong>Vercel</strong> : hébergement du site web</li>
          <li><strong>OVH</strong> : service de messagerie email</li>
          <li><strong>La Poste / transporteurs</strong> : livraison des commandes</li>
        </ul>
        <p>
          Vos données ne sont jamais vendues à des tiers. Elles ne sont transmises qu&apos;aux
          prestataires strictement nécessaires à l&apos;exécution des services.
        </p>

        <h2>6. Durée de conservation</h2>
        <ul>
          <li>
            <strong>Données clients</strong> : 3 ans après la dernière commande.
          </li>
          <li>
            <strong>Données de facturation</strong> : 10 ans (obligation légale comptable).
          </li>
          <li>
            <strong>Newsletter</strong> : jusqu&apos;à votre désinscription.
          </li>
          <li>
            <strong>Messages de contact</strong> : 1 an après le traitement de la demande.
          </li>
        </ul>

        <h2>7. Vos droits</h2>
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez
          des droits suivants :
        </p>
        <ul>
          <li><strong>Droit d&apos;accès</strong> à vos données personnelles</li>
          <li><strong>Droit de rectification</strong> de vos données</li>
          <li><strong>Droit à l&apos;effacement</strong> (« droit à l&apos;oubli »)</li>
          <li><strong>Droit à la limitation</strong> du traitement</li>
          <li><strong>Droit à la portabilité</strong> de vos données</li>
          <li><strong>Droit d&apos;opposition</strong> au traitement</li>
          <li><strong>Droit de retirer votre consentement</strong> à tout moment</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à{' '}
          <a href="mailto:contact@islanddreams.re">contact@islanddreams.re</a>.
        </p>
        <p>
          Vous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale
          de l&apos;Informatique et des Libertés) : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a>.
        </p>

        <h2>8. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
          protéger vos données personnelles contre tout accès non autorisé, perte, destruction ou
          altération. Les paiements sont sécurisés par Stripe (certifié PCI DSS).
        </p>

        <h2>9. Modifications</h2>
        <p>
          Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
          Les modifications prennent effet dès leur publication sur cette page.
        </p>
      </div>
    </main>
  );
}
