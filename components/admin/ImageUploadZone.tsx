'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { Upload, X, Star, GripVertical, Images, Search, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getMediaLibraryImages, type MediaLibraryImage } from '@/lib/actions/images';

export type ImageItem = {
  id: string;
  preview: string;
  alt: string;
  isMain: boolean;
  file?: File;
};

type Props = {
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
};

let nextId = 1;
function uid() {
  return `img-${Date.now()}-${nextId++}`;
}
function normalizeMainImage(images: ImageItem[]) {
  if (images.length === 0) return images;

  let mainIndex = images.findIndex((img) => img.isMain);
  if (mainIndex < 0) mainIndex = 0;

  return images.map((img, index) => ({
    ...img,
    isMain: index === mainIndex,
  }));
}

export function ImageUploadZone({ images, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<number | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState('');
  const [libraryImages, setLibraryImages] = useState<MediaLibraryImage[]>([]);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  const addFiles = useCallback(
    (files: FileList) => {
      const newImages: ImageItem[] = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .map((file) => ({
          id: uid(),
          preview: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^.]+$/, ''),
          isMain: false,
          file,
        }));
      onChange(normalizeMainImage([...images, ...newImages]));
    },
    [images, onChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const removeImage = (id: string) => {
    const filtered = normalizeMainImage(images.filter((img) => img.id !== id));
    onChange(filtered);
  };

  const setMainImage = (id: string) => {
    onChange(normalizeMainImage(
      images.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    ));
  };

  const updateAlt = (id: string, alt: string) => {
    onChange(
      images.map((img) => (img.id === id ? { ...img, alt } : img))
    );
  };

  const onDragStart = (index: number) => {
    dragItemRef.current = index;
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragItemRef.current === null || dragItemRef.current === index) return;

    const reordered = [...images];
    const [moved] = reordered.splice(dragItemRef.current, 1);
    reordered.splice(index, 0, moved);
    dragItemRef.current = index;
    onChange(normalizeMainImage(reordered));
  };

  const openLibrary = async () => {
    setLibraryOpen(true);
    setLibraryError('');
    setSelectedUrls([]);

    if (libraryImages.length > 0) return;

    setLibraryLoading(true);
    const result = await getMediaLibraryImages();
    if (result.error) {
      setLibraryError(result.error);
    } else {
      setLibraryImages(result.images);
    }
    setLibraryLoading(false);
  };

  const filteredLibraryImages = useMemo(() => {
    const query = libraryQuery.trim().toLowerCase();
    const currentUrls = new Set(images.map((img) => img.preview));

    return libraryImages
      .filter((img) => !currentUrls.has(img.url))
      .filter((img) => {
        if (!query) return true;
        return (
          img.alt.toLowerCase().includes(query) ||
          img.label.toLowerCase().includes(query) ||
          img.url.toLowerCase().includes(query)
        );
      });
  }, [images, libraryImages, libraryQuery]);

  const toggleLibraryImage = (url: string) => {
    setSelectedUrls((current) =>
      current.includes(url)
        ? current.filter((item) => item !== url)
        : [...current, url]
    );
  };

  const addSelectedLibraryImages = () => {
    const selected = libraryImages.filter((img) => selectedUrls.includes(img.url));
    const existing = new Set(images.map((img) => img.preview));
    const libraryItems: ImageItem[] = selected
      .filter((img) => !existing.has(img.url))
      .map((img) => ({
        id: uid(),
        preview: img.url,
        alt: img.alt,
        isMain: false,
      }));

    onChange(normalizeMainImage([...images, ...libraryItems]));
    setLibraryOpen(false);
    setSelectedUrls([]);
  };


  return (
    <div
      className="space-y-3"
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {/* Grille images */}
      {images.length > 0 && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, index) => (
              <div
                key={img.id}
                draggable
                onDragStart={() => onDragStart(index)}
                onDragOver={(e) => onDragOver(e, index)}
                className={cn(
                  'relative group rounded-lg border-2 overflow-hidden aspect-square bg-gray-50 cursor-grab active:cursor-grabbing',
                  img.isMain ? 'border-jungle-500' : 'border-gray-200'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />

                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => setMainImage(img.id)}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      img.isMain
                        ? 'bg-jungle-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    )}
                    title="Image principale"
                  >
                    <Star size={14} />
                  </button>
                  <button
                    onClick={() => removeImage(img.id)}
                    className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:bg-coral-500 hover:text-white transition-colors"
                    title="Supprimer"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Badge principal */}
                {img.isMain && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-jungle-500 text-white uppercase">
                    Principale
                  </span>
                )}

                {/* Grip */}
                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={14} className="text-white drop-shadow" />
                </div>
              </div>
            ))}

            {/* Bouton ajouter */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-jungle-500 hover:bg-jungle-50/50 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Upload size={18} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">Ajouter</span>
            </button>

            <button
              type="button"
              onClick={openLibrary}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-ocean-500 hover:bg-ocean-50/50 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Images size={18} className="text-gray-400" />
              <span className="text-[11px] text-gray-400">Bibliothèque</span>
            </button>
          </div>
          <p className="text-xs text-gray-400">
            L’image marquée <strong>Principale</strong> sera utilisée en couverture. Les autres images seront visibles dans la galerie produit.
          </p>
          <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/50 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Textes alternatifs SEO
            </p>
            {images.map((img, index) => (
              <div key={img.id} className="grid gap-2 sm:grid-cols-[88px_1fr] sm:items-center">
                <span className="text-xs text-gray-500">
                  Image {index + 1}{img.isMain ? ' · principale' : ''}
                </span>
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => updateAlt(img.id, e.target.value)}
                  placeholder="Ex: Magnet personnalisé Réunion 974"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* Zone drop si aucune image */}
      {images.length === 0 && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 hover:border-jungle-500 rounded-xl p-8 text-center cursor-pointer transition-colors hover:bg-jungle-50/30"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <Upload size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">
                Glisser des images ou cliquer pour ajouter
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PNG, JPG, WebP — la première sera l&apos;image principale
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLibrary();
            }}
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white"
          >
            <Images size={16} />
            Choisir dans la bibliothèque
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {libraryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="flex max-h-[86vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-ink">Bibliothèque d&apos;images</h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  Sélectionnez une ou plusieurs images déjà enregistrées.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLibraryOpen(false)}
                className="self-start rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 sm:self-auto"
                title="Fermer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="border-b border-gray-100 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="search"
                  value={libraryQuery}
                  onChange={(e) => setLibraryQuery(e.target.value)}
                  placeholder="Rechercher par produit, nom de fichier ou texte alternatif"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-9 pr-3 text-sm focus:border-jungle-500 focus:outline-none focus:ring-2 focus:ring-jungle-500/20"
                />
              </div>
            </div>

            <div className="min-h-[320px] flex-1 overflow-y-auto p-4">
              {libraryLoading ? (
                <div className="flex h-72 items-center justify-center text-sm text-gray-400">
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Chargement des images...
                </div>
              ) : libraryError ? (
                <div className="rounded-lg border border-coral-100 bg-coral-50 p-4 text-sm text-coral-700">
                  {libraryError}
                </div>
              ) : filteredLibraryImages.length === 0 ? (
                <div className="flex h-72 items-center justify-center text-sm text-gray-400">
                  Aucune image disponible.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {filteredLibraryImages.map((img) => {
                    const selected = selectedUrls.includes(img.url);

                    return (
                      <button
                        type="button"
                        key={img.url}
                        onClick={() => toggleLibraryImage(img.url)}
                        className={cn(
                          'group overflow-hidden rounded-lg border-2 bg-white text-left transition-colors',
                          selected ? 'border-jungle-500' : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <div className="relative aspect-square bg-gray-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                          {selected && (
                            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-jungle-500 text-white shadow">
                              <Check size={14} />
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 p-2">
                          <p className="truncate text-xs font-medium text-ink" title={img.alt}>
                            {img.alt}
                          </p>
                          <p className="truncate text-[11px] text-gray-400" title={img.label}>
                            {img.label}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-100 p-4">
              <span className="text-xs text-gray-400">
                {selectedUrls.length} image{selectedUrls.length > 1 ? 's' : ''} sélectionnée{selectedUrls.length > 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLibraryOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={addSelectedLibraryImages}
                  disabled={selectedUrls.length === 0}
                  className="rounded-lg bg-jungle-600 px-4 py-2 text-sm font-medium text-white hover:bg-jungle-700 disabled:opacity-40"
                >
                  Ajouter au produit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
