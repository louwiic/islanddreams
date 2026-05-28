'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Camera, Gift, Loader2, Mail, Music2, ThumbsUp, X } from 'lucide-react';
import { track } from '@vercel/analytics/react';

export type ContestPopupConfig = {
  enabled: boolean;
  title: string;
  description: string;
  imageUrl: string;
  prizeUrl: string;
  startDate: string;
  endDate: string;
  question: string;
  requireAnswer: boolean;
  termsText: string;
  socialText: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
};

type Props = {
  config: ContestPopupConfig | null;
};

function storageKey(config: ContestPopupConfig) {
  return `id-contest-popup-${config.title}-${config.startDate}-${config.endDate}`;
}

export function ContestPopup({ config }: Props) {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const key = useMemo(() => (config ? storageKey(config) : ''), [config]);

  useEffect(() => {
    if (!config || !key) return;
    if (sessionStorage.getItem(key) || localStorage.getItem(`${key}-submitted`)) return;

    const timer = window.setTimeout(() => setVisible(true), 2500);
    return () => window.clearTimeout(timer);
  }, [config, key]);

  if (!config || !visible) return null;

  const dismiss = () => {
    sessionStorage.setItem(key, 'dismissed');
    setVisible(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          answer,
          termsAccepted,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || data?.error) {
        setError(data?.error || 'Participation impossible pour le moment.');
        return;
      }

      localStorage.setItem(`${key}-submitted`, '1');
      sessionStorage.setItem(key, 'submitted');
      track('contest_participation_submitted', {
        contest_title: config.title,
        has_question: Boolean(config.question),
        already: Boolean(data?.already),
      });
      setSubmitted(true);
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-end justify-center p-3 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-ink/55 backdrop-blur-sm"
        onClick={dismiss}
        aria-label="Fermer le jeu concours"
      />

      <div className="relative z-10 grid max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-3xl bg-cream shadow-2xl sm:grid-cols-[0.92fr_1.08fr]">
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/65 text-white shadow-lg hover:bg-black"
          aria-label="Fermer"
        >
          <X size={19} />
        </button>

        <a
          href={config.prizeUrl || undefined}
          className="relative block min-h-[210px] bg-jungle-800 sm:min-h-full"
          onClick={(event) => {
            if (!config.prizeUrl) {
              event.preventDefault();
              return;
            }
            track('contest_prize_clicked', {
              contest_title: config.title,
              destination: config.prizeUrl,
            });
          }}
        >
          {config.imageUrl ? (
            <Image
              src={config.imageUrl}
              alt={config.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 320px"
            />
          ) : (
            <div className="flex h-full min-h-[210px] items-center justify-center text-cream">
              <Gift size={56} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-sun-400 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-ink">
              <Gift size={13} />
              Lot à gagner
            </span>
          </div>
        </a>

        <div className="overflow-y-auto px-5 py-6 sm:px-6 sm:py-8">
          {!submitted ? (
            <>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-jungle-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-jungle-800">
                Jeu concours
              </p>
              <h2 className="title-chunky-light text-3xl leading-none text-ink sm:text-4xl">
                {config.title}
              </h2>
              {config.description && (
                <p className="mt-3 text-sm leading-relaxed text-ink/60">
                  {config.description}
                </p>
              )}

              <form onSubmit={handleSubmit} className="mt-5 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/45">
                    Email de participation
                  </span>
                  <span className="flex items-center gap-2 rounded-xl border-2 border-ink/10 bg-white px-3 py-3 focus-within:border-jungle-600">
                    <Mail size={16} className="shrink-0 text-ink/35" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="ton@email.com"
                      className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink/30"
                    />
                  </span>
                </label>

                {config.question && (
                  <label className="block">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-ink/45">
                      {config.question}
                    </span>
                    <textarea
                      required={config.requireAnswer}
                      value={answer}
                      onChange={(event) => setAnswer(event.target.value)}
                      rows={3}
                      placeholder="Ta réponse..."
                      className="w-full resize-none rounded-xl border-2 border-ink/10 bg-white px-3 py-3 text-sm text-ink outline-none placeholder:text-ink/30 focus:border-jungle-600"
                    />
                  </label>
                )}

                {error && <p className="text-xs text-coral-600">{error}</p>}

                <label className="flex items-start gap-2 rounded-xl bg-white/70 p-3 text-xs leading-relaxed text-ink/55">
                  <input
                    type="checkbox"
                    required
                    checked={termsAccepted}
                    onChange={(event) => setTermsAccepted(event.target.checked)}
                    className="mt-0.5 rounded border-ink/20 text-jungle-700 focus:ring-jungle-600"
                  />
                  <span>
                    {config.termsText ||
                      'J’accepte que mes données soient utilisées pour ma participation au jeu concours et pour recevoir des communications commerciales d’Island Dreams.'}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-jungle-700 py-3 text-sm font-black uppercase tracking-wider text-cream transition-colors hover:bg-jungle-800 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={17} className="animate-spin" /> : <Gift size={17} />}
                  Participer
                </button>
              </form>
            </>
          ) : (
            <div className="py-8 text-center">
              <Gift size={42} className="mx-auto mb-4 text-sun-500" />
              <h2 className="title-chunky-light text-3xl text-ink">Participation enregistrée</h2>
              <p className="mt-2 text-sm text-ink/60">
                Merci, ton email a bien été ajouté au jeu concours.
              </p>
            </div>
          )}

          <div className="mt-5 border-t border-ink/10 pt-4">
            <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-ink/40">
              {config.socialText || 'Suis-nous sur les réseaux'}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={config.facebookUrl || 'https://www.facebook.com/islanddreams974/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('contest_social_clicked', {
                    contest_title: config.title,
                    network: 'facebook',
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-xs font-bold text-ink hover:bg-jungle-50"
              >
                <ThumbsUp size={15} />
                Facebook
              </a>
              <a
                href={config.instagramUrl || 'https://www.instagram.com/islanddreams.re/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('contest_social_clicked', {
                    contest_title: config.title,
                    network: 'instagram',
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-xs font-bold text-ink hover:bg-jungle-50"
              >
                <Camera size={15} />
                Insta
              </a>
              <a
                href={config.tiktokUrl || 'https://www.tiktok.com/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  track('contest_social_clicked', {
                    contest_title: config.title,
                    network: 'tiktok',
                  })
                }
                className="flex items-center justify-center gap-1.5 rounded-xl border border-ink/10 bg-white px-2 py-2 text-xs font-bold text-ink hover:bg-jungle-50"
              >
                <Music2 size={15} />
                TikTok
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
