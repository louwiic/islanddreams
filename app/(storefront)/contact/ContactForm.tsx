'use client';

import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export function ContactForm() {
  const [form, setForm] = useState({
    nom: '', telephone: '', email: '', objet: '', message: '', rgpd: false,
  });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error, setError]       = useState('');

  const set = (k: string, v: string | boolean) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.rgpd) { setError('Veuillez accepter la politique de confidentialité.'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setSuccess(true);
    } catch {
      setError('Une erreur est survenue, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl border border-ink/8 shadow-sm px-8 py-12 flex flex-col items-center text-center gap-4">
        <CheckCircle size={48} className="text-jungle-600" />
        <h3 className="font-black text-ink text-xl">Message envoyé&nbsp;!</h3>
        <p className="text-ink/55 text-sm leading-relaxed">
          Merci de nous avoir contacté. On revient vers toi sous 24–48h.
        </p>
        <button
          onClick={() => { setSuccess(false); setForm({ nom:'', telephone:'', email:'', objet:'', message:'', rgpd:false }); }}
          className="mt-2 text-xs text-ink/40 hover:text-ink underline transition-colors"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  const inputCls = "w-full bg-white border-2 border-ink/10 focus:border-jungle-600 rounded-xl px-4 py-3 text-ink text-sm outline-none transition-colors placeholder:text-ink/30";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-ink/8 shadow-sm px-6 py-8 md:px-8 flex flex-col gap-4"
    >
      <h2 className="font-black text-ink text-lg mb-1">Envoie-nous un message</h2>

      {/* Nom + Téléphone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
            Nom / Prénom <span className="text-coral-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.nom}
            onChange={e => set('nom', e.target.value)}
            placeholder="Marie Dupont"
            className={inputCls}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
            Téléphone
          </label>
          <input
            type="tel"
            value={form.telephone}
            onChange={e => set('telephone', e.target.value)}
            placeholder="0693 00 00 00"
            className={inputCls}
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
          Email <span className="text-coral-500">*</span>
        </label>
        <input
          type="email"
          required
          value={form.email}
          onChange={e => set('email', e.target.value)}
          placeholder="ton@email.com"
          className={inputCls}
        />
      </div>

      {/* Objet */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
          Objet de votre demande
        </label>
        <input
          type="text"
          value={form.objet}
          onChange={e => set('objet', e.target.value)}
          placeholder="Question sur une commande, partenariat…"
          className={inputCls}
        />
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-ink/50 uppercase tracking-wider">
          Message <span className="text-coral-500">*</span>
        </label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Dis-nous tout…"
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* RGPD */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="checkbox"
          checked={form.rgpd}
          onChange={e => set('rgpd', e.target.checked)}
          className="mt-0.5 shrink-0 accent-jungle-700 w-4 h-4"
        />
        <span className="text-[11px] text-ink/45 leading-relaxed group-hover:text-ink/60 transition-colors">
          En cochant cette case, j'accepte que mes données personnelles soient utilisées
          pour me recontacter dans le cadre de ma demande.{' '}
          <a href="/mentions-legales" className="underline hover:text-ink">Mentions légales</a>.
        </span>
      </label>

      {error && <p className="text-coral-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3.5 bg-jungle-700 hover:bg-jungle-800 text-cream font-bold text-sm uppercase tracking-wider rounded-xl shadow transition-colors disabled:opacity-50"
      >
        <Send size={15} />
        {loading ? 'Envoi en cours…' : 'Envoyer'}
      </button>
    </form>
  );
}
