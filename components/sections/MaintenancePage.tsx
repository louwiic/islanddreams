'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send, Lock, Wrench } from 'lucide-react';

export function MaintenancePage() {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinLoading(true);
    setPinError('');

    const res = await fetch('/api/maintenance/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin }),
    });

    if (res.ok) {
      window.location.href = '/';
    } else {
      setPinError('Code incorrect, réessaie.');
    }
    setPinLoading(false);
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);

    await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message, subject: 'Message depuis la page maintenance' }),
    });

    setContactLoading(false);
    setContactSent(true);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden">
      {/* Background hero */}
      <Image
        src="/images/hero/hero-illustration.jpg"
        alt=""
        fill
        className="object-cover object-center"
        priority
        aria-hidden
      />
      {/* Overlay sombre */}
      <div className="absolute inset-0 bg-ink/60" />

      {/* Contenu */}
      <div className="relative z-10 w-full flex flex-col items-center px-4 pt-16 pb-20 gap-8">

        {/* Logo + magnet */}
        <div className="flex flex-col items-center gap-2">
          <Image
            src="/images/magnets/magnet-974.webp"
            alt="Magnet 974"
            width={180}
            height={180}
            className="drop-shadow-2xl animate-[float_3s_ease-in-out_infinite]"
          />
        </div>

        {/* Message maintenance */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sun-400/20 border border-sun-400/40 text-sun-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Wrench size={12} />
            En cours de maintenance
          </div>
          <h1 className="title-chunky-light text-4xl md:text-6xl mb-3">
            Notre site se refait<br />une beauté
          </h1>
          <p className="text-cream/80 text-base md:text-lg font-light max-w-md mx-auto">
            On prépare quelque chose de beau pour toi. On revient très vite&nbsp;!
          </p>
          <p className="text-cream/50 text-sm mt-2 italic">
            Un bout de péi à garder, à offrir.
          </p>
        </div>

        {/* Formulaire contact */}
        <div className="w-full max-w-md bg-ink/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <h2 className="text-cream font-bold text-base mb-4">Une question ? Contacte-nous</h2>

          {contactSent ? (
            <div className="text-center py-6">
              <p className="text-jungle-400 font-semibold">Message envoyé !</p>
              <p className="text-cream/60 text-sm mt-1">On te répond dès que possible.</p>
            </div>
          ) : (
            <form onSubmit={handleContact} className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ton prénom"
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-sun-400/50"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ton email"
                required
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-sun-400/50"
              />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ton message..."
                required
                rows={3}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-sun-400/50 resize-none"
              />
              <button
                type="submit"
                disabled={contactLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sun-400 hover:bg-sun-300 text-ink font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                <Send size={14} />
                {contactLoading ? 'Envoi...' : 'Envoyer'}
              </button>
            </form>
          )}
        </div>

        {/* Unlock PIN */}
        <div className="w-full max-w-md">
          <form onSubmit={handleUnlock} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Code d'accès"
                maxLength={10}
                className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-cream placeholder-cream/40 text-sm focus:outline-none focus:border-sun-400/50"
              />
            </div>
            <button
              type="submit"
              disabled={!pin || pinLoading}
              className="px-4 py-2.5 bg-white/20 hover:bg-white/30 text-cream text-sm font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Accéder
            </button>
          </form>
          {pinError && <p className="text-coral-400 text-xs mt-1.5 text-center">{pinError}</p>}
        </div>

      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}</style>
    </div>
  );
}
