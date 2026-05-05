import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mentions légales — Island Dreams 974',
  description: 'Mentions légales du site Island Dreams, souvenirs illustrés de La Réunion.',
};

export default function MentionsLegalesPage() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-10">
        <h1
          className="text-center text-cream text-3xl md:text-4xl font-black uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Mentions légales
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-sm prose-ink">
        <p>
          L&apos;utilisation du présent site implique de respecter les termes des présentes mentions
          légales. En accédant au site, tout internaute déclare avoir lu et accepté les présentes
          mentions légales et s&apos;engage à s&apos;y conformer.
        </p>

        <h2>Article 1 : Description du Site</h2>
        <p>
          Ce site est accessible à l&apos;adresse URL suivante : https://islanddreams.re/
        </p>
        <p>
          L&apos;éditeur du Site est la société <strong>ISLAND DREAMS</strong>, immatriculée au RCS de
          St-Pierre sous le numéro 97928947700015 dont le siège social est situé 26 RUE CAFRES —
          97414 ENTRE-DEUX, représentée par Mr Smith Rodolphe, Directeur de publication, dûment
          habilité à l&apos;effet des présentes.
        </p>
        <ul>
          <li>GSM : 0692 47 28 73</li>
          <li>Email : contact@islanddreams.re</li>
        </ul>
        <p>Hébergement : Vercel Inc. — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</p>
        <p>
          Le nom de domaine est fourni par OVH, 2 rue Kellermann BP 80157 59053 ROUBAIX CEDEX 1 —
          France.
        </p>

        <h2>Article 2 : Inscription</h2>
        <p>
          L&apos;internaute peut être invité à remplir un formulaire de contact sur certains espaces
          dédiés. Il s&apos;engage à fournir des informations exactes et complètes. Son message sera
          confirmé par un message d&apos;information en direct.
        </p>

        <h2>Article 3 : Règles d&apos;utilisation du Site</h2>
        <p>
          Les utilisateurs doivent disposer des compétences, matériels et logiciels requis pour
          l&apos;utilisation d&apos;Internet et reconnaissent que les caractéristiques et les contraintes
          d&apos;Internet ne permettent pas de garantir la sécurité, la disponibilité et l&apos;intégrité des
          transmissions de données sur Internet.
        </p>
        <p>
          Les équipements (ordinateur, logiciels, moyens de télécommunications, etc.) permettant
          d&apos;accéder au Site, sont à la charge exclusive des utilisateurs, de même que les frais de
          télécommunications induits par leur utilisation.
        </p>

        <h2>Article 4 : Protection et usage des données personnelles</h2>
        <p>
          Les informations recueillies lors de la soumission du formulaire font l&apos;objet d&apos;un
          traitement informatique destiné à des fins de gestion et d&apos;étude de votre demande et ne
          seront conservées que le temps nécessaire à cet effet. Le destinataire des données est
          ISLAND DREAMS.
        </p>
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression des données
          personnelles vous concernant auprès du responsable de traitement :
        </p>
        <address className="not-italic">
          ISLAND DREAMS<br />
          26 RUE CAFRES<br />
          97414 ENTRE-DEUX
        </address>
        <p>
          Consulter notre <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </p>
        <p>
          ISLAND DREAMS est susceptible d&apos;utiliser des Cookies dans les conditions décrites dans la{' '}
          <a href="/politique-de-cookies">Politique de Cookies</a>.
        </p>

        <h2>Article 5 : Propriété Intellectuelle</h2>
        <p>
          L&apos;ensemble des contenus, pages, scripts, icônes ou sons de ce Site est la propriété
          exclusive de ISLAND DREAMS. Toute production, reproduction ou représentation de ce Site,
          en tout ou partie (textes, sons ou images), sur quelque support que ce soit est interdite.
          Le non-respect de cette interdiction constitue une contrefaçon pouvant engager la
          responsabilité civile et pénale du contrefacteur.
        </p>
        <p>
          Il est strictement interdit d&apos;utiliser ou de reproduire les marques, modèles ou dessins
          enregistrés, qui sont la propriété de ISLAND DREAMS, à quelque titre que ce soit et
          notamment à des fins publicitaires sans l&apos;accord préalable écrit de ISLAND DREAMS.
        </p>

        <h2>Article 6 : Risques liés au réseau Internet</h2>
        <p>
          Les services du Site sont accessibles 24 heures sur 24, sept jours sur sept, sauf en cas
          de force majeure ou d&apos;un événement hors du contrôle de ISLAND DREAMS, et sous réserve des
          périodes de maintenance et des pannes éventuelles.
        </p>
        <p>
          ISLAND DREAMS rappelle aux utilisateurs les caractéristiques et les limites du réseau
          Internet et décline toute responsabilité liée aux conséquences de la connexion des
          utilisateurs à ce réseau via le Site.
        </p>

        <h2>Article 7 : Responsabilité</h2>
        <p>
          ISLAND DREAMS a fait tous ses efforts pour s&apos;assurer que les informations accessibles par
          l&apos;intermédiaire de son Site soient exactes. Cependant, ISLAND DREAMS ne garantit en aucune
          manière que ces informations soient exactes, complètes et à jour.
        </p>
        <p>
          Les pages du Site peuvent contenir des liens hypertextes renvoyant vers d&apos;autres sites
          Internet gérés par des sociétés distinctes de ISLAND DREAMS, et sur lesquels ISLAND DREAMS
          n&apos;exerce aucune sorte de contrôle.
        </p>

        <h2>Article 8 : Législation</h2>
        <p>
          Les mentions sont régies par les lois françaises et tout litige relatif à leur exécution
          et/ou leur interprétation sera soumis aux tribunaux français.
        </p>

        <p className="text-ink/50 text-xs mt-12">
          © 2025 — ISLAND DREAMS, tous droits réservés.
        </p>
      </div>
    </main>
  );
}
