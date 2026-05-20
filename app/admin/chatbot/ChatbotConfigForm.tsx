'use client';

import { useState } from 'react';
import { Save, Bot, Eye, EyeOff } from 'lucide-react';

type Config = Record<string, unknown>;

export function ChatbotConfigForm({ initialConfig }: { initialConfig: Config | null }) {
  const cfg = initialConfig ?? {};
  const [enabled, setEnabled] = useState(Boolean(cfg.is_enabled));
  const [name, setName] = useState(String(cfg.assistant_name ?? 'Assistant Island Dreams'));
  const [welcome, setWelcome] = useState(String(cfg.welcome_message ?? 'Bonjour ! Comment puis-je vous aider ?'));
  const [systemPrompt, setSystemPrompt] = useState(String(cfg.system_prompt ?? ''));
  const [model, setModel] = useState(String(cfg.model ?? 'gpt-4o-mini'));
  const [temperature, setTemperature] = useState(Number(cfg.temperature ?? 0.7));
  const [primaryColor, setPrimaryColor] = useState(String(cfg.primary_color ?? '#16a34a'));
  const [position, setPosition] = useState(String(cfg.position ?? 'bottom-right'));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/admin/chatbot/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_enabled: enabled, assistant_name: name, welcome_message: welcome, system_prompt: systemPrompt, model, temperature, primary_color: primaryColor, position }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className={`rounded-xl border-2 overflow-hidden transition-colors ${enabled ? 'border-jungle-400' : 'border-gray-200'} bg-white`}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot size={18} className={enabled ? 'text-jungle-600' : 'text-gray-400'} />
          <div>
            <h2 className="font-semibold text-ink">Configuration du chatbot</h2>
            <p className="text-xs text-gray-500 mt-0.5">{enabled ? 'Chatbot visible sur le site' : 'Chatbot désactivé'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-jungle-500' : 'bg-gray-200'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;assistant</label>
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500" />
        </div>

        {/* Modèle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Modèle OpenAI</label>
          <select value={model} onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500">
            <option value="gpt-4o-mini">gpt-4o-mini (rapide, économique)</option>
            <option value="gpt-4o">gpt-4o (plus puissant)</option>
            <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          </select>
        </div>

        {/* Couleur */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Couleur principale</label>
          <div className="flex items-center gap-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-9 w-14 cursor-pointer rounded-lg border border-gray-300 p-0.5" />
            <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500">
            <option value="bottom-right">Bas droite</option>
            <option value="bottom-left">Bas gauche</option>
          </select>
        </div>

        {/* Température */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Température : <span className="font-mono text-jungle-600">{temperature}</span>
            <span className="text-xs text-gray-400 ml-2">(0 = précis, 1 = créatif)</span>
          </label>
          <input type="range" min="0" max="1" step="0.1" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
            className="w-full accent-jungle-600" />
        </div>

        {/* Message d'accueil */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Message d&apos;accueil</label>
          <textarea value={welcome} onChange={(e) => setWelcome(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 resize-none" />
        </div>

        {/* System prompt */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">System prompt</label>
            <button type="button" onClick={() => setShowPrompt(!showPrompt)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              {showPrompt ? <><EyeOff size={12} /> Masquer</> : <><Eye size={12} /> Afficher</>}
            </button>
          </div>
          {showPrompt && (
            <textarea value={systemPrompt} onChange={(e) => setSystemPrompt(e.target.value)} rows={5}
              placeholder="Décris ici le rôle et le comportement de l'assistant..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500 focus:border-jungle-500 resize-y font-mono" />
          )}
        </div>
      </div>

      <div className="px-6 pb-5">
        <button onClick={handleSave} disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${saved ? 'bg-jungle-100 text-jungle-700' : 'bg-jungle-600 hover:bg-jungle-700 text-white'} disabled:opacity-50`}>
          <Save size={15} />
          {saved ? 'Enregistré !' : saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </section>
  );
}
