'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, ArrowLeft, Trash2, Loader2, ImagePlus } from 'lucide-react';
import { createBlogPost, updateBlogPost, deleteBlogPost, uploadBlogImage, getBlogCategories } from '@/lib/actions/blog';
import type { BlogCategory } from '@/lib/actions/blog';
import { RichTextEditor } from './RichTextEditor';
import { cn } from '@/lib/utils';

type BlogFormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  coverImageAlt: string;
  categoryId: string;
  tags: string[];
  status: 'publish' | 'draft';
  featured: boolean;
  publishedAt: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
};

type Props = {
  mode: 'create' | 'edit';
  initialData?: Partial<BlogFormData> & { id?: string };
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function BlogPostForm({ mode, initialData }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<BlogFormData>({
    title: initialData?.title ?? '',
    slug: initialData?.slug ?? '',
    excerpt: initialData?.excerpt ?? '',
    content: initialData?.content ?? '',
    coverImageUrl: initialData?.coverImageUrl ?? '',
    coverImageAlt: initialData?.coverImageAlt ?? '',
    categoryId: initialData?.categoryId ?? '',
    tags: initialData?.tags ?? [],
    status: initialData?.status ?? 'draft',
    featured: initialData?.featured ?? false,
    publishedAt: initialData?.publishedAt ?? '',
    author: initialData?.author ?? 'Island Dreams',
    metaTitle: initialData?.metaTitle ?? '',
    metaDescription: initialData?.metaDescription ?? '',
    focusKeyword: initialData?.focusKeyword ?? '',
  });

  useEffect(() => {
    getBlogCategories().then(setCategories);
  }, []);

  const update = <K extends keyof BlogFormData>(key: K, value: BlogFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'title' && mode === 'create' && !initialData?.slug) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form.slug) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const url = await uploadBlogImage(form.slug, fd);
      update('coverImageUrl', url);
    } catch (err) {
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.slug.trim()) return;
    setSaving(true);
    try {
      const input = {
        title: form.title,
        slug: form.slug,
        excerpt: form.excerpt || undefined,
        content: form.content || undefined,
        cover_image_url: form.coverImageUrl || undefined,
        cover_image_alt: form.coverImageAlt || undefined,
        category_id: form.categoryId || undefined,
        tags: form.tags,
        status: form.status,
        featured: form.featured,
        published_at: form.publishedAt || undefined,
        author: form.author,
        meta_title: form.metaTitle || undefined,
        meta_description: form.metaDescription || undefined,
        focus_keyword: form.focusKeyword || undefined,
      };

      if (mode === 'edit' && initialData?.id) {
        await updateBlogPost(initialData.id, input);
      } else {
        await createBlogPost(input);
      }
      router.push('/admin/blog');
      router.refresh();
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm('Supprimer cet article ?')) return;
    setDeleting(true);
    await deleteBlogPost(initialData.id);
    router.push('/admin/blog');
    router.refresh();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/blog')} className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeft size={18} className="text-gray-500" />
          </button>
          <h1 className="text-xl font-bold text-ink">
            {mode === 'create' ? 'Nouvel article' : 'Modifier l\'article'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {mode === 'edit' && (
            <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1 px-3 py-2 text-sm text-coral-600 hover:bg-coral-50 rounded-lg">
              <Trash2 size={14} />
              {deleting ? '...' : 'Supprimer'}
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !form.title.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-semibold hover:bg-jungle-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Titre + Slug */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Titre</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                placeholder="Titre de l'article"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 outline-none"
              />
            </div>
          </div>

          {/* Extrait */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Extrait</label>
            <textarea
              value={form.excerpt}
              onChange={(e) => update('excerpt', e.target.value)}
              rows={3}
              placeholder="Court résumé pour les cartes et le SEO..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500 outline-none resize-y"
            />
          </div>

          {/* Contenu */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Contenu</label>
            <RichTextEditor
              value={form.content}
              onChange={(html) => update('content', html)}
            />
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink">SEO</h3>
            <input
              type="text"
              value={form.metaTitle}
              onChange={(e) => update('metaTitle', e.target.value)}
              placeholder="Meta title"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
            <textarea
              value={form.metaDescription}
              onChange={(e) => update('metaDescription', e.target.value)}
              rows={2}
              placeholder="Meta description"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20 resize-y"
            />
            <input
              type="text"
              value={form.focusKeyword}
              onChange={(e) => update('focusKeyword', e.target.value)}
              placeholder="Mot-clé principal"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
            {/* Aperçu Google */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50/50">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">Aperçu Google</p>
              <p className="text-[#1a0dab] text-base leading-tight truncate">{form.metaTitle || `${form.title || 'Titre'} | Island Dreams`}</p>
              <p className="text-[#006621] text-xs truncate">islanddreams.re/blog/{form.slug || 'slug'}</p>
              <p className="text-[#545454] text-xs leading-relaxed line-clamp-2">{form.metaDescription || form.excerpt || 'Ajoutez une meta description.'}</p>
            </div>
          </div>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Statut */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink">Publication</h3>
            <div className="space-y-2">
              {(['draft', 'publish'] as const).map((s) => (
                <label key={s} className={cn('flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer', form.status === s ? 'bg-gray-50 ring-1 ring-gray-200' : 'hover:bg-gray-50')}>
                  <input type="radio" name="status" value={s} checked={form.status === s} onChange={() => update('status', s)} className="sr-only" />
                  <span className={cn('w-2.5 h-2.5 rounded-full', s === 'publish' ? 'bg-green-400' : 'bg-gray-300')} />
                  <span className="text-sm text-ink">{s === 'publish' ? 'Publié' : 'Brouillon'}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Date de publication</label>
              <input
                type="datetime-local"
                value={form.publishedAt ? form.publishedAt.slice(0, 16) : ''}
                onChange={(e) => update('publishedAt', e.target.value ? new Date(e.target.value).toISOString() : '')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm text-ink">Article à la une</span>
            </label>
          </div>

          {/* Image couverture */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-ink">Image de couverture</h3>
            {form.coverImageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                <Image src={form.coverImageUrl} alt={form.coverImageAlt || ''} fill className="object-cover" sizes="400px" />
                <button onClick={() => update('coverImageUrl', '')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full hover:bg-black/70">
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-jungle-400 hover:bg-jungle-50/30 transition-colors">
                {uploading ? <Loader2 size={24} className="text-gray-400 animate-spin" /> : <ImagePlus size={24} className="text-gray-400" />}
                <span className="text-xs text-gray-400 mt-2">{uploading ? 'Upload...' : 'Ajouter une image'}</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={!form.slug || uploading} />
              </label>
            )}
            <input
              type="text"
              value={form.coverImageAlt}
              onChange={(e) => update('coverImageAlt', e.target.value)}
              placeholder="Texte alternatif"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>

          {/* Catégorie */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Catégorie</h3>
            <select
              value={form.categoryId}
              onChange={(e) => update('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20 bg-white"
            >
              <option value="">Aucune</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Tags</h3>
            <div className="flex gap-2 mb-2 flex-wrap">
              {form.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-jungle-50 text-jungle-700 text-xs font-medium">
                  {tag}
                  <button onClick={() => update('tags', form.tags.filter(t => t !== tag))} className="hover:text-coral-500">&times;</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Ajouter un tag"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
              />
              <button onClick={addTag} className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">+</button>
            </div>
          </div>

          {/* Auteur */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-ink mb-3">Auteur</h3>
            <input
              type="text"
              value={form.author}
              onChange={(e) => update('author', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-jungle-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
