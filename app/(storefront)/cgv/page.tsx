import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions Générales de Vente — Island Dreams 974',
  description: 'Conditions générales de vente du site Island Dreams, souvenirs illustrés de La Réunion.',
};

export default function CGVPage() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-10">
        <h1
          className="text-center text-cream text-3xl md:text-4xl font-black uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Conditions Générales de Vente
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-sm prose-ink">
        <p className="text-ink/60 italic">Dernière mise à jour : mai 2026</p>

        <h2>Article 1 — Objet</h2>
        <p>
          Les présentes conditions générales de vente (CGV) régissent les ventes de produits
          effectuées par la société ISLAND DREAMS via le site internet islanddreams.re. Toute
          commande implique l&apos;acceptation sans réserve des présentes CGV.
        </p>

        <h2>Article 2 — Identité du vendeur</h2>
        <address className="not-italic">
          <strong>ISLAND DREAMS</strong><br />
          RCS St-Pierre : 97928947700015<br />
          26 RUE CAFRES — 97414 ENTRE-DEUX<br />
          La Réunion<br />
          contact@islanddreams.re — 0693 05 66 67
        </address>

        <h2>Article 3 — Produits</h2>
        <p>
          Les produits proposés à la vente sont des souvenirs illustrés de La Réunion : magnets,
          stickers, textile (serviettes, tapis de plage), goodies et décoration. Les photographies
          et descriptions des produits sont les plus fidèles possibles mais ne sauraient engager la
          responsabilité du vendeur en cas de légères différences avec le produit livré.
        </p>
        <p>
          Les produits sont proposés dans la limite des stocks disponibles. En cas
          d&apos;indisponibilité d&apos;un produit après passation de la commande, le client en sera
          informé par email et remboursé dans les meilleurs délais.
        </p>

        <h2>Article 4 — Prix</h2>
        <p>
          Les prix sont indiqués en euros (€) toutes taxes comprises (TTC). ISLAND DREAMS se
          réserve le droit de modifier ses prix à tout moment. Les produits sont facturés au prix en
          vigueur au moment de la validation de la commande.
        </p>
        <p>Les frais de livraison sont indiqués avant la validation de la commande.</p>

        <h2>Article 5 — Commande</h2>
        <p>
          Le client passe commande sur le site islanddreams.re en ajoutant les produits souhaités
          à son panier, puis en procédant au paiement. Un email de confirmation est envoyé au
          client après validation du paiement.
        </p>
        <p>
          ISLAND DREAMS se réserve le droit de refuser ou d&apos;annuler toute commande en cas de
          litige antérieur avec le client, de suspicion de fraude ou de commande anormale.
        </p>

        <h2>Article 6 — Paiement</h2>
        <p>
          Le paiement s&apos;effectue en ligne par carte bancaire via la plateforme sécurisée
          <strong> Stripe</strong> (certifiée PCI DSS). Le montant est débité au moment de la
          validation de la commande.
        </p>
        <p>
          Les données de paiement sont traitées directement par Stripe. ISLAND DREAMS n&apos;a
          jamais accès aux numéros de carte bancaire du client.
        </p>

        <h2>Article 7 — Livraison</h2>
        <p>Les produits sont livrés à l&apos;adresse indiquée par le client lors de la commande.</p>
        <h3>Zones et délais indicatifs :</h3>
        <ul>
          <li><strong>La Réunion (974)</strong> : 3 à 7 jours ouvrés</li>
          <li><strong>France métropolitaine</strong> : 7 à 14 jours ouvrés</li>
          <li><strong>DOM-TOM</strong> : 7 à 14 jours ouvrés</li>
        </ul>
        <p>
          Ces délais sont indicatifs et ne constituent pas un engagement contractuel. En cas de
          retard important, le client sera informé par email.
        </p>

        <h2>Article 8 — Droit de rétractation</h2>
        <p>
          Conformément à l&apos;article L221-18 du Code de la consommation, le client dispose d&apos;un
          délai de <strong>14 jours</strong> à compter de la réception de sa commande pour exercer
          son droit de rétractation, sans avoir à justifier de motif ni à payer de pénalité.
        </p>
        <p>
          Pour exercer ce droit, le client doit informer ISLAND DREAMS par email à
          contact@islanddreams.re de sa décision de rétractation. Les produits doivent être
          retournés dans leur état d&apos;origine, non utilisés et dans leur emballage d&apos;origine.
        </p>
        <p>
          Les frais de retour sont à la charge du client. Le remboursement sera effectué dans un
          délai de 14 jours suivant la réception des produits retournés, par le même moyen de
          paiement que celui utilisé lors de la commande.
        </p>

        <h2>Article 9 — Garanties et réclamations</h2>
        <p>
          Les produits bénéficient de la garantie légale de conformité (articles L217-4 et suivants
          du Code de la consommation) et de la garantie contre les vices cachés (articles 1641 et
          suivants du Code civil).
        </p>
        <p>
          En cas de produit défectueux ou non conforme, le client peut contacter ISLAND DREAMS à
          contact@islanddreams.re dans un délai de 30 jours suivant la réception pour obtenir un
          échange ou un remboursement.
        </p>

        <h2>Article 10 — Propriété intellectuelle</h2>
        <p>
          Toutes les illustrations, designs et créations présents sur les produits Island Dreams
          sont la propriété exclusive de ISLAND DREAMS. Toute reproduction, même partielle, est
          strictement interdite sans autorisation écrite préalable.
        </p>

        <h2>Article 11 — Données personnelles</h2>
        <p>
          Les données personnelles collectées lors des commandes sont traitées conformément à notre{' '}
          <a href="/politique-de-confidentialite">Politique de confidentialité</a> et au Règlement
          Général sur la Protection des Données (RGPD).
        </p>

        <h2>Article 12 — Médiation</h2>
        <p>
          En cas de litige, le client peut recourir gratuitement au service de médiation de la
          consommation. Le médiateur peut être saisi en ligne sur la plateforme européenne de
          règlement en ligne des litiges :{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">
            ec.europa.eu/consumers/odr
          </a>
        </p>

        <h2>Article 13 — Droit applicable</h2>
        <p>
          Les présentes CGV sont soumises au droit français. Tout litige relatif à leur
          interprétation ou à leur exécution relève des tribunaux français compétents.
        </p>

        <p className="text-ink/50 text-xs mt-12">
          © 2025 — ISLAND DREAMS, tous droits réservés.
        </p>
      </div>
    </main>
  );
}
