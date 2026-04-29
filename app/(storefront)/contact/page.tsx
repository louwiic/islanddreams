import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact — Island Dreams 974',
  description: 'Contactez Island Dreams pour toute question sur nos souvenirs péi : magnets, stickers, textiles et plus.',
};

const INFOS = [
  {
    icon: Phone,
    label: 'Téléphone',
    value: '0693 05 66 67',
    href: 'tel:+262693056667',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'contact@islanddreams.re',
    href: 'mailto:contact@islanddreams.re',
  },
  {
    icon: MapPin,
    label: 'Localisation',
    value: 'La Réunion — 974',
    href: null,
  },
  {
    icon: ExternalLink,
    label: 'Facebook',
    value: 'Island Dreams',
    href: 'https://www.facebook.com/profile.php?id=61553257432359',
  },
];

export default function ContactPage() {
  return (
    <main className="bg-cream min-h-screen">
      {/* Bandeau top pour la navbar */}
      <div className="bg-jungle-700 pt-24 pb-12 px-4 text-center">
        <p className="text-sun-450 text-xs uppercase tracking-[0.3em] font-bold mb-3">
          Island Dreams · 974
        </p>
        <h1 className="title-chunky-light text-4xl md:text-6xl text-cream">
          KONTAK
          <br />
          ANOU
        </h1>
        <p className="mt-3 text-cream/60 text-sm md:text-base italic">
          On répond vite, promis&nbsp;!
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-14 md:py-20 grid md:grid-cols-2 gap-10 md:gap-16 items-start">

        {/* Infos de contact */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="font-black text-ink text-xl mb-1">Parlons péi</h2>
            <p className="text-ink/55 text-sm leading-relaxed">
              Une question sur une commande, un projet personnalisé ou simplement envie de dire alon ?
              On est là&nbsp;!
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {INFOS.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-jungle-700 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-sun-450" />
                </div>
                <div>
                  <p className="text-xs text-ink/40 uppercase tracking-wider font-semibold">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith('http') ? '_blank' : undefined}
                      rel="noopener noreferrer"
                      className="text-ink font-bold text-sm hover:text-jungle-600 transition-colors"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-ink font-bold text-sm">{value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Délai de réponse */}
          <div className="bg-jungle-50 border border-jungle-100 rounded-2xl px-5 py-4">
            <p className="text-jungle-700 font-bold text-sm mb-1">⏱ Délai de réponse</p>
            <p className="text-ink/60 text-xs leading-relaxed">
              On s'efforce de répondre sous <strong className="text-ink">24–48h</strong> du lundi au vendredi.
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <ContactForm />
      </div>
    </main>
  );
}
