import type { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Conditions du jeu concours — Island Dreams 974',
  description: 'Conditions de participation au jeu concours Island Dreams.',
  alternates: { canonical: '/conditions-jeu-concours' },
};

function settingToString(value: unknown) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return String(value);
  if (typeof value === 'number') return String(value);
  return '';
}

function formatDate(value: string) {
  if (!value) return 'date non précisée';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Indian/Reunion',
  }).format(new Date(`${value}T00:00:00+04:00`));
}

async function getContestSettings() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('key, value')
    .in('key', [
      'contest_popup_enabled',
      'contest_popup_title',
      'contest_popup_description',
      'contest_popup_prize_source',
      'contest_popup_product_slug',
      'contest_popup_start_date',
      'contest_popup_end_date',
      'contest_popup_question',
      'contest_popup_terms_text',
    ]);

  const settings = Object.fromEntries(
    ((data ?? []) as { key: string; value: unknown }[]).map((row) => [
      row.key,
      settingToString(row.value),
    ])
  );

  let prizeName = 'le lot présenté dans la popup du jeu concours';
  if (settings.contest_popup_prize_source === 'product' && settings.contest_popup_product_slug) {
    const { data: product } = await supabase
      .from('products')
      .select('name')
      .eq('slug', settings.contest_popup_product_slug)
      .maybeSingle();
    if (product?.name) prizeName = product.name;
  }

  return {
    title: settings.contest_popup_title || 'Jeu concours Island Dreams',
    description: settings.contest_popup_description || '',
    startDate: settings.contest_popup_start_date || '',
    endDate: settings.contest_popup_end_date || '',
    question: settings.contest_popup_question || '',
    termsText: settings.contest_popup_terms_text || '',
    prizeName,
  };
}

export default async function ConditionsJeuConcoursPage() {
  const contest = await getContestSettings();

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-jungle-800 pb-10 pt-24">
        <h1
          className="text-center text-3xl font-black uppercase tracking-wide text-cream md:text-4xl"
          style={{ fontFamily: 'var(--font-heading, serif)' }}
        >
          Conditions du jeu concours
        </h1>
      </div>

      <div className="legal-prose prose prose-sm prose-ink mx-auto max-w-3xl px-6 py-12">
        <p className="text-ink/60 italic">Dernière mise à jour : juin 2026</p>

        <h2>Article 1 — Organisateur</h2>
        <p>
          Le jeu concours est organisé par <strong>ISLAND DREAMS</strong>, société immatriculée au
          RCS de St-Pierre sous le numéro 97928947700015, dont le siège social est situé 26 RUE
          CAFRES — 97414 ENTRE-DEUX, La Réunion.
        </p>
        <p>Contact : contact@islanddreams.re</p>

        <h2>Article 2 — Jeu concerné</h2>
        <p>
          Les présentes conditions s’appliquent au jeu concours intitulé{' '}
          <strong>{contest.title}</strong>.
        </p>
        {contest.description && <p>{contest.description}</p>}

        <h2>Article 3 — Période de participation</h2>
        <p>
          Le jeu concours est ouvert du <strong>{formatDate(contest.startDate)}</strong> au{' '}
          <strong>{formatDate(contest.endDate)}</strong>, heure de La Réunion.
        </p>
        <p>
          Toute participation envoyée avant la date de début ou après la date de fin pourra être
          considérée comme non valide.
        </p>

        <h2>Article 4 — Conditions de participation</h2>
        <p>
          La participation est gratuite et ouverte aux personnes disposant d’une adresse email
          valide. Une seule participation par adresse email est acceptée pour un même jeu concours.
        </p>
        <p>
          La participation s’effectue via le formulaire affiché sur le site. Le participant doit
          renseigner une adresse email valide, accepter les présentes conditions et, si une question
          est prévue, fournir une réponse sincère. Toute participation incomplète, frauduleuse,
          automatisée ou réalisée avec une identité usurpée pourra être écartée.
        </p>
        {contest.question && (
          <p>
            Le participant peut être invité à répondre à la question suivante :{' '}
            <strong>{contest.question}</strong>
          </p>
        )}

        <h2>Article 5 — Lot à gagner</h2>
        <p>
          Le lot mis en jeu est : <strong>{contest.prizeName}</strong>. Le lot ne peut pas être
          échangé contre sa valeur en espèces, sauf décision contraire de l’organisateur.
        </p>

        <h2>Article 6 — Désignation du gagnant</h2>
        <p>
          Le gagnant sera désigné parmi les participations valides selon les modalités définies par
          ISLAND DREAMS. Il pourra être contacté par email à l’adresse indiquée lors de sa
          participation.
        </p>
        <p>
          Si le gagnant ne répond pas dans un délai raisonnable après la prise de contact, ou si les
          informations transmises ne permettent pas de confirmer sa participation, ISLAND DREAMS se
          réserve le droit de désigner un autre gagnant parmi les participations valides.
        </p>

        <h2>Article 7 — Données personnelles et communications commerciales</h2>
        <p>
          Les données collectées dans le cadre du jeu concours comprennent notamment l’adresse email
          du participant et, le cas échéant, sa réponse à la question posée.
        </p>
        <p>
          Ces données sont utilisées pour enregistrer la participation, contrôler l’unicité de la
          participation, désigner et contacter le gagnant, gérer la remise du lot et traiter les
          demandes relatives au jeu concours.
        </p>
        <p>
          Si le participant accepte de recevoir des communications commerciales, son adresse email
          pourra également être utilisée pour lui envoyer les nouveautés, offres et actualités
          d’ISLAND DREAMS. Il peut retirer son consentement à tout moment en utilisant le lien de
          désinscription présent dans les emails ou en écrivant à contact@islanddreams.re.
        </p>
        {contest.termsText && <p>Texte de consentement affiché : {contest.termsText}</p>}
        <p>
          Le participant peut demander l’accès, la rectification ou la suppression de ses données en
          écrivant à contact@islanddreams.re. Il peut également consulter la{' '}
          <a href="/politique-de-confidentialite">politique de confidentialité</a>.
        </p>

        <h2>Article 8 — Réseaux sociaux</h2>
        <p>
          Le jeu peut inviter les participants à suivre ISLAND DREAMS sur Facebook, Instagram ou
          TikTok. Sauf mention contraire, ces actions ne sont pas obligatoires pour valider la
          participation sur le site.
        </p>
        <p>
          Ce jeu concours n’est ni géré, ni parrainé, ni administré par Facebook, Instagram ou
          TikTok. Ces plateformes ne peuvent être tenues responsables de l’organisation du jeu.
        </p>

        <h2>Article 9 — Responsabilité</h2>
        <p>
          ISLAND DREAMS se réserve le droit de modifier, reporter ou annuler le jeu concours en cas
          de nécessité, de fraude, de problème technique ou de force majeure.
        </p>
        <p>
          ISLAND DREAMS ne saurait être tenue responsable des erreurs de saisie, problèmes de
          connexion, indisponibilités techniques temporaires ou dysfonctionnements empêchant une
          participation d’être enregistrée correctement.
        </p>
      </div>
    </main>
  );
}
