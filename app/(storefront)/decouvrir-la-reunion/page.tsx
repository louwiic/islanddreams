import type { Metadata } from 'next';
import Link from 'next/link';
import { DecouvrirClient } from './DecouvrirClient';

export const metadata: Metadata = {
  title: 'Découvrir La Réunion — Island Dreams 974',
  description: 'Partez à la découverte des communes de La Réunion. Cirques, lagon, volcans, forêts et culture créole : chaque ville a son histoire.',
  alternates: { canonical: '/decouvrir-la-reunion' },
};

const COMMUNES = [
  { id: 'saint-denis',          name: 'Saint-Denis',            region: 'Nord',         postalCode: '97400', description: "Saint-Denis, cœur battant de La Réunion, mêle histoire et nature avec élégance. Dans le Jardin de l'État, oasis urbaine, les canons anciens racontent les temps passés, gardiens silencieux des mémoires coloniales. Entre les arbres centenaires et les allées ombragées, le jardin offre un refuge paisible au milieu de l'agitation citadine. Saint-Denis, entre patrimoine vivant et vie moderne, invite à découvrir ses trésors cachés, là où passé et présent s'entrelacent harmonieusement.", tag: 'saint-denis', color: 'jungle' },
  { id: 'sainte-marie',         name: 'Sainte-Marie',           region: 'Nord',         postalCode: '97438', description: "À Sainte-Marie, le vent salé caresse les champs de canne tandis que les avions effleurent les nuages, entre ciel et terre. Surplombant l'océan, la statue de la Vierge veille silencieusement, bras ouverts sur les marins et les passants. Ville d'accueil et de passage, elle abrite l'aéroport, mais aussi des trésors plus discrets : temples, chapelles, sentiers côtiers. Entre effervescence et recueillement, Sainte-Marie unit le mouvement du monde à la douceur d'une foi ancrée dans la pierre et les cœurs.", tag: 'sainte-marie', color: 'ocean' },
  { id: 'sainte-suzanne',       name: 'Sainte-Suzanne',         region: 'Nord',         postalCode: '97441', description: "Sainte-Suzanne, joyau de l'Est réunionnais, s'illumine grâce à son phare historique, gardien vigilant de la côte sauvage. Entre plages préservées et champs de canne à sucre, la ville mêle traditions créoles et nature généreuse. Ses sentiers invitent à la découverte de cascades cachées et panoramas grandioses. Chaque soir, le phare éclaire l'horizon, symbole d'espoir et de sécurité. Sainte-Suzanne incarne ainsi l'équilibre entre histoire, paysages marins et douceur de vivre authentique.", tag: 'sainte-suzanne', color: 'jungle' },
  { id: 'saint-andre',          name: 'Saint-André',            region: 'Nord-Est',     postalCode: '97440', description: "À Sainte-André, l'Est de La Réunion bat au rythme des tambours malbars et des parfums d'encens. Le temple du Colosse, flamboyant sous le soleil, raconte l'épopée des engagés venus d'Inde. Entre champs de canne à sucre et rivières tranquilles, la ville tisse un lien profond entre mémoire et modernité. Ici, les cultures se mêlent comme les couleurs d'un sari. Sainte-André, c'est une mosaïque vivante, un carrefour d'âmes et de traditions où l'histoire se célèbre au quotidien.", tag: 'saint-andre', color: 'coral' },
  { id: 'bras-panon',           name: 'Bras-Panon',             region: 'Est',          postalCode: '97412', description: "Nichée entre champs et rivière, Bras-Panon est le cœur agricole de l'Est réunionnais. Connue pour sa foire agricole annuelle, la ville célèbre avec fierté son savoir-faire paysan et ses produits du terroir. Les plantations de vanille y dessinent un paysage parfumé, reflet d'une tradition vivante. Traversée par la rivière des Roches, propice aux balades, Bras-Panon mêle nature généreuse et authenticité rurale. Ici, la terre nourrit les hommes et les traditions cultivent un profond attachement à l'île.", tag: 'bras-panon', color: 'sun' },
  { id: 'saint-benoit',         name: 'Saint-Benoît',           region: 'Est',          postalCode: '97470', description: "Au cœur de l'Est sauvage, Saint-Benoît vibre au rythme des cascades et des rivières impétueuses. Ses marchés colorés regorgent d'épices et de saveurs locales. La pêche traditionnelle des bichiques, petits poissons si prisés, perpétue un savoir-faire ancestral. Porte d'accès au cirque de Mafate, la ville allie authenticité créole et modernité. Entre nature généreuse et traditions vivantes, Saint-Benoît incarne une harmonie unique où la culture réunionnaise se célèbre au quotidien.", tag: 'saint-benoit', color: 'jungle' },
  { id: 'sainte-anne',          name: 'Sainte-Anne',            region: 'Est',          postalCode: '97434', description: "Sainte-Anne, nichée à l'est de l'île, rayonne par sa majestueuse église aux allures de cathédrale, joyau d'architecture baroque créole. Non loin, le bassin Bleu invite à la fraîcheur, entouré d'une végétation luxuriante. À la saison chaude, les letchis juteux teintent les étals de rouge, régalant petits et grands. Sainte-Anne, c'est un village entre foi, nature et gourmandise, où le patrimoine religieux côtoie la douceur de vivre typique de l'Est réunionnais.", tag: 'sainte-anne', color: 'ocean' },
  { id: 'sainte-rose',          name: 'Sainte-Rose',            region: 'Est',          postalCode: '97439', description: "À Sainte-Rose, l'Est sauvage s'épanche entre mer indomptable et coulées volcaniques figées. La petite église Notre-Dame-des-Laves, miraculeusement épargnée par l'éruption de 1977, veille sur le village comme un symbole de résilience. Le long de la route des Laves, la nature raconte l'histoire du feu et du renouveau. Entre pêche traditionnelle, sentiers côtiers et souffle du Piton de la Fournaise tout proche, Sainte-Rose offre une escapade unique, où l'on ressent pleinement la puissance vivante de l'île.", tag: 'sainte-rose', color: 'coral' },
  { id: 'saint-philippe',       name: 'Saint-Philippe',         region: 'Sud-Est',      postalCode: '97442', description: "Saint-Philippe, à l'extrême sud-est de l'île, est une terre de feu et de verdure. Bordée par les coulées noires du volcan et les falaises battues par l'océan, la ville respire l'intensité sauvage. Sa forêt de Mare-Longue, luxuriante et mystérieuse, abrite des plantes rares et endémiques. Ici pousse aussi la vanille, précieuse liane parfumée. Saint-Philippe, c'est l'alliance brute de la lave et de la vie, un bout du monde où la nature impose sa beauté indomptable.", tag: 'saint-philippe', color: 'jungle' },
  { id: 'saint-joseph',         name: 'Saint-Joseph',           region: 'Sud',          postalCode: '97480', description: "Saint-Joseph, à l'extrême sud de l'île, abrite des trésors de nature sauvage. La cascade Grand Galet, perle de la rivière Langevin, dévale en gerbes fraîches au cœur d'un écrin verdoyant. Dans les arbres, le gecko vert brille comme une émeraude vivante, discret mais fascinant. Dans le ciel, les paille-en-queue planent avec grâce au-dessus des falaises. Terre de contrastes, entre eaux vives, falaises volcaniques et forêts luxuriantes, Saint-Joseph chante l'authenticité du Sud profond de La Réunion.", tag: 'saint-joseph', color: 'ocean' },
  { id: 'petite-ile',           name: 'Petite-Île',             region: 'Sud',          postalCode: '97429', description: "Nichée entre mer et montagnes, La Petite-Île séduit par son authenticité et sa douceur de vivre. Le Domaine du Relais propose de magnifiques balades à cheval à travers champs et panoramas côtiers, offrant un contact privilégié avec la nature. Chaque année, la fête de l'ail anime la commune dans une ambiance conviviale, mêlant saveurs locales, musique et traditions. Entre patrimoine agricole et plaisirs simples, La Petite-Île incarne parfaitement l'âme chaleureuse du Sud sauvage réunionnais.", tag: 'petite-ile', color: 'sun' },
  { id: 'saint-pierre',         name: 'Saint-Pierre',           region: 'Sud',          postalCode: '97410', description: "La côte est très agréable avec sa grande plage aménagée pour le tourisme balnéaire. C'est l'endroit idéal pour faire de la voile, pêcher ou simplement se détendre au soleil. Cela doit vraiment être plaisant pour les touristes comme pour les habitants. Quant au bœuf Moka, c'est une race de vaches françaises présente à La Réunion. Autrefois, elles servaient surtout à tirer des charges, ce qui montre leur rôle important dans l'agriculture de l'île.", tag: 'saint-pierre', color: 'coral' },
  { id: 'le-tampon',            name: 'Le Tampon',               region: 'Hauts du Sud', postalCode: '97430', description: "Perché sur les hauteurs, Le Tampon s'étire entre brumes légères et paysages verdoyants. Ses ruelles vibrent au rythme des marchés épicés, où l'odeur du curcuma et du géranium embaume l'air. Entre plantations de camélias et jardins secrets, la ville mêle traditions créoles et modernité audacieuse. Les panoramas sur les cirques alentours invitent à la rêverie, tandis que les fêtes populaires célèbrent une identité fière et chaleureuse. Le Tampon, c'est le souffle vivant d'une nature généreuse et d'un peuple passionné.", tag: 'le-tampon', color: 'jungle' },
  { id: 'entre-deux',           name: 'Entre-Deux',              region: 'Hauts du Sud', postalCode: '97414', description: "Lovée entre les rivières Saint-Étienne et Bras de la Plaine, L'Entre-Deux charme par son calme et son authenticité. Son pont de Bras de la Plaine, impressionnant ouvrage suspendu, relie passé et présent au cœur des montagnes verdoyantes. Le village est parsemé de magnifiques cases créoles, fleuries et colorées, témoins d'un art de vivre traditionnel. Nichée entre ciel et ravines, L'Entre-Deux incarne la douceur montagnarde réunionnaise, entre patrimoine, nature généreuse et sérénité préservée.", tag: 'entre-deux', color: 'ocean' },
  { id: 'cilaos',               name: 'Cilaos',                  region: 'Cirques',      postalCode: '97413', description: "Cilaos, joyau niché au cœur des montagnes, séduit par son atmosphère chaleureuse et authentique. Entouré de sommets majestueux, ce village invite à la randonnée, à la découverte de sources chaudes et de panoramas époustouflants. Ses ruelles abritent une architecture créole typique et une vie locale rythmée par les marchés et les fêtes traditionnelles. Cilaos, c'est aussi une terre de saveurs, le bibasse, où lentilles et vin locaux célèbrent le terroir réunionnais, entre nature et convivialité.", tag: 'cilaos', color: 'coral' },
  { id: 'salazie',              name: 'Salazie',                 region: 'Cirques',      postalCode: '97433', description: "Nichée au cœur d'un cirque verdoyant, Salazie séduit par sa nature luxuriante et son atmosphère paisible. C'est un paradis pour les amateurs de randonnée, avec ses sentiers sillonnant montagnes, forêts et ravines. La célèbre cascade du Voile de la Mariée, fine et majestueuse, émerveille les visiteurs. Le village d'Hell-Bourg, avec ses maisons créoles emblématiques, témoigne du riche patrimoine architectural de la commune. Salazie allie beauté naturelle, histoire et authenticité au cœur de l'île intense.", tag: 'salazie', color: 'jungle' },
  { id: 'mafate',               name: 'Mafate',                  region: 'Cirques',      postalCode: '97419', description: "Mafate, joyau secret de La Réunion, n'a ni route ni voiture. On y accède à pied, sac au dos, ou par hélicoptère, comme un voyage hors du temps. Ses villages perchés — Marla, La Nouvelle, Roche Plate — semblent suspendus entre ciel et ravines. Le facteur, véritable héros des sentiers, livre le courrier à la force des jambes, défiant les montagnes. Entre panoramas grandioses et silence habité, Mafate offre une aventure humaine, une leçon de simplicité et de liberté.", tag: 'mafate', color: 'sun' },
  { id: 'saint-leu',            name: 'Saint-Leu',               region: 'Ouest',        postalCode: '97436', description: "Saint-Leu, bordée par les vagues et caressée par les alizés, est le repaire des surfeurs et des rêveurs. Sur ses plages ensoleillées, les tortues marines viennent se reposer, protégées au sein de Kélonia. Dans le ciel, les parapentes colorent l'azur, offrant une vue à couper le souffle sur le lagon. Entre mer et montagne, traditions créoles et sensations fortes, Saint-Leu incarne une liberté douce, celle d'une île où nature et aventure ne font qu'un.", tag: 'saint-leu', color: 'ocean' },
  { id: 'les-trois-bassins',    name: 'Trois-Bassins',           region: 'Ouest',        postalCode: '97426', description: "Les Trois-Bassins, village paisible de la côte Ouest, charme par ses paysages sauvages et ses plages secrètes. Nichée entre montagnes et océan, la commune invite à la détente au rythme des vagues et des alizés. Ses bassins naturels, joyaux cachés, offrent des eaux calmes pour les familles et les randonneurs. Entre traditions créoles, artisanat local et nature généreuse, Les Trois-Bassins incarne la douceur de vivre réunionnaise, loin de l'agitation urbaine, dans un cadre authentique et préservé.", tag: 'les-trois-bassins', color: 'jungle' },
  { id: 'etang-sale',           name: 'Étang-Salé',              region: 'Ouest',        postalCode: '97427', description: "L'Étang-Salé possède l'une des rares plages de sable noir volcanique de La Réunion. Sa couleur intense, due au mélange de basalte, de corail et d'olivine, attire aussi bien les touristes que les Réunionnais. On y pratique le beach-volley, le beach-tennis et d'autres loisirs toute l'année. La plage est bordée par une vaste forêt abritant un parc à crocodiles et un zoo, offrant un contraste étonnant entre nature sauvage, détente balnéaire et découverte animale dans un même lieu.", tag: 'etang-sale', color: 'coral' },
  { id: 'les-avirons',          name: 'Les Avirons',             region: 'Ouest',        postalCode: '97425', description: "Les Avirons, perchée entre mer et montagne, offre un cadre paisible et verdoyant. On y trouve un parc dédié aux tortues terrestres, où petits et grands découvrent ces animaux fascinants. La ville rend aussi hommage à ses anciens combattants, mémoire vivante de son histoire. Plus haut, la majestueuse forêt du Tévelave, riche en biodiversité, invite à la randonnée et à l'évasion. Ce mélange de nature, de mémoire et de découverte fait des Avirons un lieu unique et chaleureux.", tag: 'les-avirons', color: 'sun' },
  { id: 'saint-louis',          name: 'Saint-Louis',             region: 'Ouest',        postalCode: '97450', description: "À Saint-Louis, qu'on appelle « Sin Loui » en créole réunionnais, se trouve un étang nommé le Gol, tout près de la côte. Ce lieu est marqué par la présence de la sucrerie du Gol, un élément central du paysage local. La culture de la canne à sucre y joue un rôle historique majeur, ayant façonné l'identité de la commune. Aujourd'hui, cette tradition perdure et représente un symbole fort du patrimoine agricole et culturel de La Réunion.", tag: 'saint-louis', color: 'jungle' },
  { id: 'saint-paul',           name: 'Saint-Paul',              region: 'Nord-Ouest',   postalCode: '97460', description: "Saint-Paul, entre mer et montagne, rayonne par son marché forain où parfums d'épices et artisanat créole éveillent les sens. La vieille roue à eau, silencieuse mais emblématique, veille sur ce passé agricole toujours vivant. Non loin, un coin d'eau paisible permet aux familles de se rafraîchir en toute simplicité. Ville de culture, de mémoire et de métissage, Saint-Paul offre une escapade où l'histoire, la nature et la douceur de vivre se rencontrent harmonieusement.", tag: 'saint-paul', color: 'ocean' },
  { id: 'le-port',              name: 'Le Port',                 region: 'Nord-Ouest',   postalCode: '97420', description: "Le Port, porte maritime animée de La Réunion, bat au rythme des cargaisons et des navires venus du monde entier. Son port industriel, cœur économique, s'étend entre docks et cales animées. La ville, vivante et dynamique, offre aussi des quartiers colorés où résonnent musiques et saveurs créoles. Entre le tumulte du commerce maritime et les activités de pêche, Le Port allie énergie urbaine et authenticité réunionnaise, véritable carrefour entre terre et mer.", tag: 'le-port', color: 'coral' },
  { id: 'la-possession',        name: 'La Possession',           region: 'Nord-Ouest',   postalCode: '97419', description: "À La Possession, le souffle du passé résonne encore au rythme des rails disparus. Longtemps, le train serpentait entre mer et montagnes, reliant les villages et racontant des histoires de vie et de partage. Aujourd'hui, la ville mêle ce patrimoine nostalgique à une énergie moderne, entre marchés colorés et sentiers secrets. La Possession, c'est un pont entre hier et demain, où la mémoire du train continue d'animer le cœur vibrant de cette cité réunionnaise.", tag: 'la-possession', color: 'jungle' },
  { id: 'plaine-des-palmistes', name: 'Plaine des Palmistes',    region: 'Hauts',        postalCode: '97431', description: "Au cœur de l'île, entre forêt primaire et brumes mystérieuses. Fraisiers sauvages, palmistes rares, randonnées vers le volcan. La Plaine des Palmistes offre un cadre naturel unique, où la fraîcheur des hauts invite à la contemplation et à l'évasion.", tag: 'plaine-des-palmistes', color: 'sun' },
  { id: 'saint-gilles',         name: 'Saint-Gilles-les-Bains',  region: 'Ouest',        postalCode: '97434', description: "Saint-Gilles-les-Bains, joyau de la côte ouest, incarne l'esprit balnéaire de La Réunion. Son lagon aux eaux turquoise abrite poissons colorés et coraux paisibles, paradis des baigneurs et plongeurs. Le port, cœur vivant de la ville, réunit pêcheurs, plaisanciers et flâneurs. Le marché artisanal parfume les rues de vanille et de samoussas. Entre plages dorées, sorties en mer et couchers de soleil flamboyants, Saint-Gilles invite à savourer chaque instant, entre farniente, découvertes et douceur de vivre créole.", tag: 'saint-gilles', color: 'ocean' },
];

const REGIONS = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Hauts du Sud', 'Cirques', 'Ouest', 'Nord-Ouest', 'Hauts'];

export default function DecouvrirPage() {
  return (
    <main className="bg-cream min-h-screen">
      {/* Hero */}
      <div className="bg-jungle-800 pt-28 pb-12 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-black text-cream mb-2 leading-tight uppercase tracking-wide">
          Island Dreams — Îles de rêves
        </h1>
      </div>

      {/* Intro */}
      <div className="max-w-6xl mx-auto px-6 py-14">
        <h2 className="text-2xl md:text-3xl font-black text-ink uppercase tracking-wide mb-10">
          Découvrez La Réunion autrement
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
          <div>
            <h3 className="text-sm font-black text-ink uppercase tracking-wide mb-3">
              Bienvenue dans l'univers où l'amour de La Réunion devient création.
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Chaque produit que nous proposons est né de la fierté de notre île, de sa beauté brute et de son énergie unique. Ici, rien n'est choisi au hasard : chaque tapis de plage, chaque serviette, chaque pareo, chaque plaque déco raconte une histoire… <strong className="text-ink">celle de notre patrimoine, de nos villes, et de nos racines.</strong>
            </p>
            <h3 className="text-sm font-black text-ink uppercase tracking-wide mb-3">
              Un cadeau idéal — un souvenir inoubliable — un symbole d'appartenance.
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Que vous soyez d'ici ou d'ailleurs, laissez-vous toucher par l'âme réunionnaise. Offrez-vous un objet qui parle au cœur, un objet qui rassemble, un objet qui dure.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black text-ink uppercase tracking-wide mb-3">
              Emmenez un morceau de notre île avec vous
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              Nos tapis et serviettes de plage ultra confort vous accompagnent lors de vos instants précieux : brasés entre amis, couchers de soleil, pique-niques en famille ou instants de détente au bord du lagon.
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
              Nos magnets à collectionner, à placer sur la grande plaque métallique de La Réunion, vous invitent à un voyage unique à travers nos plus belles villes, chacune représentée par un design exclusif, chargé d'émotion et de fierté créole.
            </p>
            <h3 className="text-sm font-black text-ink uppercase tracking-wide mb-3">
              Ramenez un ti bout de paradis à la maison.
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Et faites revivre vos plus beaux moments, chaque jour.
            </p>
          </div>
        </div>
      </div>

      {/* Carte interactive */}
      <DecouvrirClient communes={COMMUNES} regions={REGIONS} />

      {/* CTA */}
      <div className="bg-jungle-800 py-16 px-4 text-center">
        <h2 className="text-2xl font-black text-cream mb-3">Zot péi, zot fiérté</h2>
        <p className="text-jungle-200 mb-6 max-w-md mx-auto">
          Retrouvez l'esprit de chaque commune dans nos collections de magnets, stickers et souvenirs.
        </p>
        <Link
          href="/boutique"
          className="inline-flex items-center gap-2 px-8 py-3 bg-sun-400 text-ink text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-sun-500 transition-colors"
        >
          Explorer la boutique
        </Link>
      </div>
    </main>
  );
}
