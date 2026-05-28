'use client';

import { useRef, useState, useTransition } from 'react';
import { Gift, Loader2, Save, Upload } from 'lucide-react';
import { updateSettings } from '@/lib/actions/settings';
import { uploadProductImage } from '@/lib/actions/images';

type Props = {
  initialSettings: Record<string, string>;
  products: { id: string; name: string; slug: string; status: string | null }[];
};

export function ContestSettings({ initialSettings, products }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(initialSettings.contest_popup_enabled === 'true');
  const [prizeSource, setPrizeSource] = useState(
    initialSettings.contest_popup_prize_source || 'manual'
  );
  const [productSlug, setProductSlug] = useState(initialSettings.contest_popup_product_slug || '');
  const [title, setTitle] = useState(initialSettings.contest_popup_title || 'Jeu concours Island Dreams');
  const [description, setDescription] = useState(
    initialSettings.contest_popup_description || 'Tente ta chance pour gagner ce lot péi.'
  );
  const [imageUrl, setImageUrl] = useState(initialSettings.contest_popup_image_url || '');
  const [prizeUrl, setPrizeUrl] = useState(initialSettings.contest_popup_prize_url || '');
  const [startDate, setStartDate] = useState(initialSettings.contest_popup_start_date || '');
  const [endDate, setEndDate] = useState(initialSettings.contest_popup_end_date || '');
  const [question, setQuestion] = useState(initialSettings.contest_popup_question || '');
  const [requireAnswer, setRequireAnswer] = useState(
    initialSettings.contest_popup_require_answer === 'true'
  );
  const [termsText, setTermsText] = useState(
    initialSettings.contest_popup_terms_text ||
      'J’accepte que mes données soient utilisées pour ma participation au jeu concours et pour recevoir des communications commerciales d’Island Dreams.'
  );
  const [socialText, setSocialText] = useState(
    initialSettings.contest_popup_social_text ||
      'Double tes chances en participant aussi sur nos réseaux'
  );
  const [facebookUrl, setFacebookUrl] = useState(
    initialSettings.contest_popup_facebook_url || 'https://www.facebook.com/islanddreams974/'
  );
  const [instagramUrl, setInstagramUrl] = useState(
    initialSettings.contest_popup_instagram_url || 'https://www.instagram.com/islanddreams.re/'
  );
  const [tiktokUrl, setTiktokUrl] = useState(initialSettings.contest_popup_tiktok_url || '');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setError('');
    setMessage('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const result = await uploadProductImage('jeu-concours', formData);

      if (result.error || !result.url) {
        setError(result.error || 'Import image impossible.');
        return;
      }

      setImageUrl(result.url);
      setMessage('Image importée. Pense à enregistrer.');
    } catch {
      setError('Impossible de traiter cette image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    setError('');
    setMessage('');

    startTransition(async () => {
      await updateSettings({
        contest_popup_enabled: String(enabled),
        contest_popup_prize_source: prizeSource,
        contest_popup_product_slug: productSlug,
        contest_popup_title: title.trim(),
        contest_popup_description: description.trim(),
        contest_popup_image_url: imageUrl.trim(),
        contest_popup_prize_url: prizeUrl.trim(),
        contest_popup_start_date: startDate,
        contest_popup_end_date: endDate,
        contest_popup_question: question.trim(),
        contest_popup_require_answer: String(requireAnswer),
        contest_popup_terms_text: termsText.trim(),
        contest_popup_social_text: socialText.trim(),
        contest_popup_facebook_url: facebookUrl.trim(),
        contest_popup_instagram_url: instagramUrl.trim(),
        contest_popup_tiktok_url: tiktokUrl.trim(),
      });

      setMessage('Jeu concours enregistré.');
    });
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Gift size={18} className="text-sun-600" />
        <h2 className="font-semibold text-ink">Popup jeu concours</h2>
      </div>

      <div className="p-6 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher la popup jeu concours pendant la période
          </span>
        </label>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Texte</label>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lot à gagner</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 has-[:checked]:border-jungle-500 has-[:checked]:bg-jungle-50">
              <input
                type="radio"
                name="contest-prize-source"
                value="manual"
                checked={prizeSource === 'manual'}
                onChange={() => setPrizeSource('manual')}
                className="text-jungle-600 focus:ring-jungle-500"
              />
              Image + lien manuel
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 has-[:checked]:border-jungle-500 has-[:checked]:bg-jungle-50">
              <input
                type="radio"
                name="contest-prize-source"
                value="product"
                checked={prizeSource === 'product'}
                onChange={() => setPrizeSource('product')}
                className="text-jungle-600 focus:ring-jungle-500"
              />
              Produit boutique
            </label>
          </div>
        </div>

        {prizeSource === 'product' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produit à gagner
            </label>
            <select
              value={productSlug}
              onChange={(event) => setProductSlug(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            >
              <option value="">Choisir un produit</option>
              {products.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}{product.status !== 'publish' ? ' (non publié)' : ''}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">
              La popup utilisera automatiquement l’image principale et le lien de la fiche produit.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image du lot à gagner
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleUpload(event.target.files?.[0] ?? null)}
                className="sr-only"
              />
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  Importer
                </button>
              </div>
              {imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="" className="mt-3 h-28 w-28 rounded-xl object-cover border border-gray-200" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien du lot optionnel
              </label>
              <input
                type="url"
                value={prizeUrl}
                onChange={(event) => setPrizeUrl(event.target.value)}
                placeholder="https://... ou /boutique/produit"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Début d’affichage</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fin d’affichage</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question optionnelle
          </label>
          <input
            type="text"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ex: Quelle commune aimerais-tu voir en prochain magnet ?"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={requireAnswer}
              onChange={(event) => setRequireAnswer(event.target.checked)}
              className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
            />
            Réponse obligatoire si la question est affichée
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Texte CGU / consentement
          </label>
          <textarea
            rows={3}
            value={termsText}
            onChange={(event) => setTermsText(event.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 resize-y"
          />
          <p className="mt-1 text-xs text-gray-400">
            Ce texte est affiché avec une case obligatoire dans la popup.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phrase au-dessus des boutons réseaux
          </label>
          <input
            type="text"
            value={socialText}
            onChange={(event) => setSocialText(event.target.value)}
            placeholder="Ex: Double tes chances en participant aussi sur nos réseaux"
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
            <input
              type="url"
              value={facebookUrl}
              onChange={(event) => setFacebookUrl(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <input
              type="url"
              value={instagramUrl}
              onChange={(event) => setInstagramUrl(event.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
            <input
              type="url"
              value={tiktokUrl}
              onChange={(event) => setTiktokUrl(event.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
        </div>

        {error && <p className="text-sm text-coral-600">{error}</p>}
        {message && <p className="text-sm text-jungle-600">{message}</p>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending || uploading}
            className="inline-flex items-center gap-2 px-5 py-2 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Enregistrer le jeu
          </button>
        </div>
      </div>
    </section>
  );
}
