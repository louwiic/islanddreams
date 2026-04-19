'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
  Save,
  GripVertical,
  Tag,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/lib/actions/categories';

type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort_order: number | null;
  is_nav_featured: boolean | null;
  nav_label: string | null;
  nav_color: string | null;
  image_url: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FormData = {
  name: string;
  slug: string;
  description: string;
  navLabel: string;
  navColor: string;
  isNavFeatured: boolean;
};

const DEFAULT_FORM: FormData = {
  name: '',
  slug: '',
  description: '',
  navLabel: '',
  navColor: '#e84c3d',
  isNavFeatured: false,
};

const NAV_COLORS = [
  { value: '#e84c3d', label: 'Coral', class: 'bg-coral-500' },
  { value: '#ff6b2c', label: 'Flamboyant', class: 'bg-flamboyant' },
  { value: '#f5c144', label: 'Soleil', class: 'bg-sun-400' },
  { value: '#3f7e4f', label: 'Jungle', class: 'bg-jungle-500' },
  { value: '#3d8fa3', label: 'Océan', class: 'bg-ocean-500' },
  { value: '#b14ea8', label: 'Bougainvillée', class: 'bg-bougainvillea' },
];

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function CategoryManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormData>(DEFAULT_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const navFeatured = categories.find((c) => c.is_nav_featured);

  const startCreate = () => {
    setEditing(null);
    setForm(DEFAULT_FORM);
    setCreating(true);
    setError('');
  };

  const startEdit = (cat: Category) => {
    setCreating(false);
    setEditing(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description ?? '',
      navLabel: cat.nav_label ?? '',
      navColor: cat.nav_color ?? '#e84c3d',
      isNavFeatured: cat.is_nav_featured ?? false,
    });
    setError('');
  };

  const cancel = () => {
    setEditing(null);
    setCreating(false);
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      if (creating) {
        const result = await createCategory({
          name: form.name,
          slug: form.slug || slugify(form.name),
          description: form.description || undefined,
          navLabel: form.navLabel || undefined,
          navColor: form.navColor || undefined,
          isNavFeatured: form.isNavFeatured,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setCreating(false);
          router.refresh();
        }
      } else if (editing) {
        const result = await updateCategory(editing, {
          name: form.name,
          slug: form.slug,
          description: form.description || undefined,
          navLabel: form.navLabel || undefined,
          navColor: form.navColor || undefined,
          isNavFeatured: form.isNavFeatured,
        });
        if (result.error) {
          setError(result.error);
        } else {
          setEditing(null);
          router.refresh();
        }
      }
    } catch {
      setError('Erreur inattendue');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer la catégorie "${name}" ?`)) return;
    const result = await deleteCategory(id);
    if (result.error) {
      setError(result.error);
    } else {
      router.refresh();
    }
  };

  const isFormOpen = creating || editing !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">
            {categories.length} catégorie{categories.length > 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      {/* Catégorie navbar featured */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Navigation size={16} className="text-jungle-600" />
          <h3 className="text-sm font-semibold text-ink">
            Catégorie spéciale navbar
          </h3>
        </div>
        <div className="p-5">
          {navFeatured ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: navFeatured.nav_color ?? '#e84c3d' }}
                />
                <div>
                  <p className="text-sm font-medium text-ink">
                    {navFeatured.nav_label || navFeatured.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Affichée à gauche du logo dans la navbar
                  </p>
                </div>
              </div>
              <button
                onClick={() => startEdit(navFeatured)}
                className="text-xs text-jungle-600 hover:underline"
              >
                Modifier
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Aucune catégorie spéciale. Créez ou modifiez une catégorie et
              cochez &quot;Afficher dans la navbar&quot;.
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-coral-50 border border-coral-200 rounded-lg text-sm text-coral-700">
          {error}
        </div>
      )}

      {/* Formulaire création/édition */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border-2 border-jungle-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">
              {creating ? 'Nouvelle catégorie' : `Modifier "${form.name}"`}
            </h3>
            <button
              onClick={cancel}
              className="p-1 rounded hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-coral-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setForm((f) => ({
                      ...f,
                      name,
                      slug: creating ? slugify(name) : f.slug,
                    }));
                  }}
                  placeholder="Ex: Fêtes des mères"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder="fetes-des-meres"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Description de la catégorie"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
              />
            </div>

            {/* Section navbar */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isNavFeatured}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isNavFeatured: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    Afficher dans la navbar
                  </span>
                  <p className="text-xs text-gray-400">
                    Sera placée à gauche du logo. Une seule catégorie à la
                    fois.
                  </p>
                </div>
              </label>

              {form.isNavFeatured && (
                <div className="pl-7 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label dans la navbar
                    </label>
                    <input
                      type="text"
                      value={form.navLabel}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, navLabel: e.target.value }))
                      }
                      placeholder={form.name || 'Fêtes des mères'}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-jungle-500/20 focus:border-jungle-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Si vide, le nom de la catégorie sera utilisé
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur
                    </label>
                    <div className="flex gap-2">
                      {NAV_COLORS.map((color) => (
                        <button
                          key={color.value}
                          onClick={() =>
                            setForm((f) => ({ ...f, navColor: color.value }))
                          }
                          className={cn(
                            'w-8 h-8 rounded-full transition-all',
                            color.class,
                            form.navColor === color.value
                              ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                              : 'hover:scale-105'
                          )}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancel}
                className="px-4 py-2 text-sm text-gray-600 hover:text-ink transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-jungle-600 text-white rounded-lg text-sm font-medium hover:bg-jungle-700 transition-colors disabled:opacity-40"
              >
                <Save size={16} />
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Liste des catégories */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3 font-medium">Catégorie</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Navbar</th>
                <th className="px-5 py-3 font-medium w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Tag size={16} className="text-gray-300" />
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-gray-400">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 font-mono">
                    {cat.slug}
                  </td>
                  <td className="px-5 py-3">
                    {cat.is_nav_featured ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-jungle-50 text-jungle-600">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: cat.nav_color ?? '#e84c3d',
                          }}
                        />
                        {cat.nav_label || cat.name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        title="Modifier"
                      >
                        <Pencil size={14} className="text-gray-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        className="p-1.5 rounded-lg hover:bg-coral-50 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 size={14} className="text-gray-400 hover:text-coral-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
