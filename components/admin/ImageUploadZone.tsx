'use client';

import { useCallback, useRef } from 'react';
import { Upload, X, Star, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function ImageUploadZone({ images, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragItemRef = useRef<number | null>(null);

  const addFiles = useCallback(
    (files: FileList) => {
      const newImages: ImageItem[] = Array.from(files)
        .filter((f) => f.type.startsWith('image/'))
        .map((file) => ({
          id: uid(),
          preview: URL.createObjectURL(file),
          alt: file.name.replace(/\.[^.]+$/, ''),
          isMain: images.length === 0,
          file,
        }));

      // Première image ajoutée = image principale
      if (images.length === 0 && newImages.length > 0) {
        newImages[0].isMain = true;
      }

      onChange([...images, ...newImages]);
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
    const filtered = images.filter((img) => img.id !== id);
    // Si on supprime l'image principale, la première restante devient principale
    if (filtered.length > 0 && !filtered.some((img) => img.isMain)) {
      filtered[0].isMain = true;
    }
    onChange(filtered);
  };

  const setMainImage = (id: string) => {
    onChange(
      images.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
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
    onChange(reordered);
  };

  const updateAlt = (id: string, alt: string) => {
    onChange(images.map((img) => (img.id === id ? { ...img, alt } : img)));
  };

  return (
    <div className="space-y-3">
      {/* Grille images */}
      {images.length > 0 && (
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
        </div>
      )}

      {/* Zone drop si aucune image */}
      {images.length === 0 && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
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
    </div>
  );
}
