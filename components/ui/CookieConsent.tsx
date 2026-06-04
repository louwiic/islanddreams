'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Analytics } from '@vercel/analytics/react';

type ConsentValue = 'accepted' | 'rejected' | null;

const STORAGE_KEY = 'islanddreams_cookie_consent';

function readConsent(): ConsentValue {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}

function saveConsent(value: Exclude<ConsentValue, null>) {
  localStorage.setItem(STORAGE_KEY, value);
  localStorage.setItem(`${STORAGE_KEY}_date`, new Date().toISOString());
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [ready, setReady] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      setConsent(readConsent());
      setReady(true);
    });
  }, []);

  const choose = (value: Exclude<ConsentValue, null>) => {
    saveConsent(value);
    setConsent(value);
    setCustomizing(false);
  };

  if (!ready) return null;

  return (
    <>
      {consent === 'accepted' && <Analytics />}

      {!consent && (
        <div className="fixed inset-x-3 bottom-3 z-[2147482500] mx-auto max-w-3xl rounded-2xl border border-jungle-200 bg-white p-4 shadow-2xl shadow-black/20 sm:bottom-5 sm:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-black uppercase tracking-[0.12em] text-ink">
                Gestion des cookies
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">
                Nous utilisons des cookies nécessaires au fonctionnement du site et, avec votre
                accord, des cookies de mesure d&apos;audience pour améliorer Island Dreams.
              </p>
              <Link
                href="/politique-de-cookies"
                className="mt-2 inline-flex text-xs font-semibold text-jungle-700 underline-offset-4 hover:underline"
              >
                Lire la politique de cookies
              </Link>

              {customizing && (
                <div className="mt-4 space-y-3 rounded-xl bg-cream/70 p-3">
                  <label className="flex items-start gap-3 text-sm text-ink/75">
                    <input type="checkbox" checked disabled className="mt-1" />
                    <span>
                      <strong className="text-ink">Cookies nécessaires</strong>
                      <span className="block text-xs text-ink/55">
                        Panier, sécurité, paiement et préférences indispensables.
                      </span>
                    </span>
                  </label>
                  <label className="flex items-start gap-3 text-sm text-ink/75">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(event) => setAnalyticsEnabled(event.target.checked)}
                      className="mt-1"
                    />
                    <span>
                      <strong className="text-ink">Mesure d&apos;audience</strong>
                      <span className="block text-xs text-ink/55">
                        Statistiques anonymisées pour comprendre les pages consultées.
                      </span>
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col">
              {customizing ? (
                <button
                  type="button"
                  onClick={() => choose(analyticsEnabled ? 'accepted' : 'rejected')}
                  className="rounded-xl bg-jungle-700 px-4 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-jungle-800"
                >
                  Enregistrer
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => choose('accepted')}
                  className="rounded-xl bg-jungle-700 px-4 py-2.5 text-sm font-bold text-cream transition-colors hover:bg-jungle-800"
                >
                  Accepter
                </button>
              )}
              <button
                type="button"
                onClick={() => choose('rejected')}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-gray-50"
              >
                Refuser
              </button>
              {!customizing && (
                <button
                  type="button"
                  onClick={() => setCustomizing(true)}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-jungle-700 transition-colors hover:bg-jungle-50"
                >
                  Personnaliser
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
