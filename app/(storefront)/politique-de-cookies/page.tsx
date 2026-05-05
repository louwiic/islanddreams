import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politique de cookies — Island Dreams 974',
  description: 'Politique de cookies du site Island Dreams.',
};

export default function PolitiqueCookiesPage() {
  return (
    <main className="bg-cream min-h-screen">
      <div className="bg-jungle-800 pt-24 pb-10">
        <h1
          className="text-center text-cream text-3xl md:text-4xl font-black uppercase tracking-wide"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Politique de cookies
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 prose prose-sm prose-ink">
        <p className="text-ink/60 italic">
          Cette politique de cookies a été mise à jour pour la dernière fois le 29 janvier 2026 et
          s&apos;applique aux citoyens et aux résidents permanents légaux de l&apos;Espace Économique
          Européen et de la Suisse.
        </p>

        <h2>1. Introduction</h2>
        <p>
          Notre site web, https://www.islanddreams.re (ci-après : « le site web ») utilise des
          cookies et autres technologies liées (par simplification, toutes ces technologies sont
          désignées par le terme « cookies »). Des cookies sont également placés par des tierces
          parties que nous avons engagées. Dans le document ci-dessous, nous vous informons de
          l&apos;utilisation des cookies sur notre site web.
        </p>

        <h2>2. Que sont les cookies ?</h2>
        <p>
          Un cookie est un petit fichier simple envoyé avec les pages de ce site web et stocké par
          votre navigateur sur le disque dur de votre ordinateur ou d&apos;un autre appareil. Les
          informations qui y sont stockées peuvent être renvoyées à nos serveurs ou aux serveurs des
          tierces parties concernées lors d&apos;une visite ultérieure.
        </p>

        <h2>3. Que sont les scripts ?</h2>
        <p>
          Un script est un élément de code utilisé pour que notre site web fonctionne correctement
          et de manière interactive. Ce code est exécuté sur notre serveur ou sur votre appareil.
        </p>

        <h2>4. Qu&apos;est-ce qu&apos;une balise invisible ?</h2>
        <p>
          Une balise invisible (ou balise web) est un petit morceau de texte ou d&apos;image invisible
          sur un site web, utilisé pour suivre le trafic sur un site web. Pour ce faire, diverses
          données vous concernant sont stockées à l&apos;aide de balises invisibles.
        </p>

        <h2>5. Cookies utilisés</h2>

        <h3>5.1 Cookies techniques ou fonctionnels</h3>
        <p>
          Certains cookies assurent le fonctionnement correct de certaines parties du site web et la
          prise en compte de vos préférences en tant qu&apos;utilisateur. En plaçant des cookies
          fonctionnels, nous vous facilitons la visite de notre site web. Nous pouvons placer ces
          cookies sans votre consentement.
        </p>

        <h3>5.2 Cookies de marketing/suivi</h3>
        <p>
          Les cookies de marketing/suivi sont des cookies ou toute autre forme de stockage local,
          utilisés pour créer des profils d&apos;utilisateurs afin d&apos;afficher de la publicité ou de
          suivre l&apos;utilisateur sur ce site web ou sur plusieurs sites web dans des finalités
          marketing similaires.
        </p>

        <h3>5.3 Services utilisés</h3>
        <table>
          <thead>
            <tr>
              <th>Service</th>
              <th>Utilisation</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stripe</td>
              <td>Traitement de paiement</td>
              <td>Fonctionnel</td>
            </tr>
            <tr>
              <td>Supabase</td>
              <td>Authentification et données</td>
              <td>Fonctionnel</td>
            </tr>
            <tr>
              <td>Vercel</td>
              <td>Hébergement et analytics</td>
              <td>Fonctionnel / Statistiques</td>
            </tr>
          </tbody>
        </table>

        <h2>6. Consentement</h2>
        <p>
          Lorsque vous visitez notre site web pour la première fois, nous vous montrerons une
          fenêtre contextuelle avec une explication sur les cookies. Dès que vous cliquez sur
          « Accepter » vous nous autorisez à utiliser les catégories de cookies et d&apos;extensions
          que vous avez sélectionnés dans la fenêtre contextuelle. Vous pouvez désactiver
          l&apos;utilisation des cookies via votre navigateur, mais veuillez noter que notre site web
          pourrait ne plus fonctionner correctement.
        </p>

        <h2>7. Activer/désactiver et supprimer les cookies</h2>
        <p>
          Vous pouvez utiliser votre navigateur internet pour supprimer automatiquement ou
          manuellement les cookies. Vous pouvez également spécifier que certains cookies ne peuvent
          pas être placés. Veuillez noter que notre site web peut ne pas marcher correctement si
          tous les cookies sont désactivés.
        </p>

        <h2>8. Vos droits concernant les données personnelles</h2>
        <p>Vous avez les droits suivants concernant vos données personnelles :</p>
        <ul>
          <li>
            <strong>Droit d&apos;information</strong> : vous avez le droit de savoir pourquoi vos
            données personnelles sont nécessaires, ce qui leur arrivera et combien de temps elles
            seront conservées.
          </li>
          <li>
            <strong>Droit d&apos;accès</strong> : vous avez le droit d&apos;accéder à vos données
            personnelles que nous connaissons.
          </li>
          <li>
            <strong>Droit de rectification</strong> : vous avez le droit à tout moment de
            compléter, corriger, faire supprimer ou bloquer vos données personnelles.
          </li>
          <li>
            <strong>Droit de révocation</strong> : si vous nous donnez votre consentement pour le
            traitement de vos données, vous avez le droit de révoquer ce consentement et de faire
            supprimer vos données personnelles.
          </li>
          <li>
            <strong>Droit de portabilité</strong> : vous avez le droit de demander toutes vos
            données personnelles au responsable du traitement et de les transférer dans leur
            intégralité à un autre responsable du traitement.
          </li>
          <li>
            <strong>Droit d&apos;opposition</strong> : vous pouvez vous opposer au traitement de vos
            données.
          </li>
        </ul>
        <p>
          Pour exercer ces droits, veuillez nous contacter à contact@islanddreams.re.
        </p>

        <h2>9. Coordonnées</h2>
        <address className="not-italic">
          ISLAND DREAMS<br />
          26 RUE CAFRES<br />
          97414 ENTRE-DEUX<br />
          La Réunion<br />
          contact@islanddreams.re<br />
          0693 05 66 67
        </address>
      </div>
    </main>
  );
}
