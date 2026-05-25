'use client';

import { useRef, useState, useTransition } from 'react';
import { Film, Loader2, Save, Upload } from 'lucide-react';
import { updateSettings } from '@/lib/actions/settings';
import { createClient } from '@/lib/supabase/client';

type DemoProduct = {
  id: string;
  name: string;
  slug: string;
  status: string | null;
};

type Props = {
  products: DemoProduct[];
  initialSettings: Record<string, string>;
};

const DEFAULT_BUBBLE_POSITION = 'bottom-right';

function getVideoDuration(file: File) {
  return new Promise<number | null>((resolve) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    let settled = false;

    const finish = (duration: number | null) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(duration);
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(video.duration);
        return;
      }

      // Some mobile MP4/MOV files expose Infinity/NaN until seeking once.
      video.currentTime = Number.MAX_SAFE_INTEGER;
    };
    video.ontimeupdate = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        finish(video.duration);
      }
    };
    video.onerror = () => {
      finish(null);
    };
    video.src = url;

    window.setTimeout(() => finish(null), 3500);
  });
}

export function DemoVideoSettings({ products, initialSettings }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [enabled, setEnabled] = useState(initialSettings.demo_video_enabled === 'true');
  const [videoUrl, setVideoUrl] = useState(initialSettings.demo_video_url || '');
  const [posterUrl, setPosterUrl] = useState(initialSettings.demo_video_poster_url || '');
  const [productSlug, setProductSlug] = useState(initialSettings.demo_video_product_slug || '');
  const [title, setTitle] = useState(initialSettings.demo_video_title || 'Voir le produit en action');
  const [bubblePosition, setBubblePosition] = useState(
    initialSettings.demo_video_bubble_position || DEFAULT_BUBBLE_POSITION
  );
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpload = async (file: File | null) => {
    if (!file) return;
    setError('');
    setMessage('');

    try {
      const duration = await getVideoDuration(file);
      if (duration && duration > 30.5) {
        setError('La vidéo doit durer 30 secondes maximum.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setUploading(true);
      const res = await fetch('/api/admin/demo-video/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });
      const result = await res.json().catch(() => null);

      if (!res.ok || !result || result.error) {
        setError(result?.error || 'Upload vidéo impossible');
        return;
      }

      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from(result.bucket)
        .uploadToSignedUrl(result.path, result.token, file, {
          contentType: file.type,
        });

      if (uploadError) {
        setError(uploadError.message);
        return;
      }

      setVideoUrl(result.url);
      setMessage(
        duration
          ? 'Vidéo importée. Pense à enregistrer les réglages.'
          : 'Vidéo importée. Durée non lisible par le navigateur, vérifie bien qu’elle fait 30 secondes maximum.'
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Impossible de traiter cette vidéo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    setError('');
    setMessage('');

    startTransition(async () => {
      await updateSettings({
        demo_video_enabled: String(enabled),
        demo_video_url: videoUrl.trim(),
        demo_video_poster_url: posterUrl.trim(),
        demo_video_product_slug: productSlug,
        demo_video_title: title.trim(),
        demo_video_bubble_position: bubblePosition,
      });

      setMessage('Réglages vidéo enregistrés.');
    });
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <Film size={18} className="text-coral-600" />
        <h2 className="font-semibold text-ink">Vidéo démo boutique</h2>
      </div>

      <div className="p-6 space-y-5">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
          />
          <span className="text-sm font-medium text-gray-700">
            Afficher la vidéo flottante sur la boutique
          </span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vidéo courte
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
            />
          </div>
          <div className="flex items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => handleUpload(e.target.files?.[0] ?? null)}
              className="sr-only"
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
        </div>
        <p className="text-xs text-gray-400 -mt-3">
          Format conseillé : MP4 vertical, 30 secondes maximum, moins de 200 Mo.
        </p>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image d’aperçu optionnelle
          </label>
          <input
            type="url"
            value={posterUrl}
            onChange={(e) => setPosterUrl(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Produit ciblé
            </label>
            <select
              value={productSlug}
              onChange={(e) => setProductSlug(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            >
              <option value="">Choisir un produit</option>
              {products.map((product) => (
                <option key={product.id} value={product.slug}>
                  {product.name}{product.status !== 'publish' ? ' (non publié)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <select
              value={bubblePosition}
              onChange={(e) => setBubblePosition(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 bg-white"
            >
              <option value="bottom-right">Bas droite</option>
              <option value="bottom-left">Bas gauche</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre affiché
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
          />
        </div>

        {videoUrl && (
          <div className="w-36 overflow-hidden rounded-lg border border-gray-200 bg-black">
            <video src={videoUrl} poster={posterUrl || undefined} muted playsInline controls className="aspect-[9/16] w-full object-cover" />
          </div>
        )}

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
            Enregistrer la vidéo
          </button>
        </div>
      </div>
    </section>
  );
}
