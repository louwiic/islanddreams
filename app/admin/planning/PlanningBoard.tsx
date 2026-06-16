'use client';

import { useMemo, useState, useTransition } from 'react';
import {
  CalendarDays,
  Check,
  ClipboardList,
  Edit3,
  ExternalLink,
  LayoutGrid,
  List,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import {
  savePlanningTasks,
} from '@/lib/actions/planning';
import type {
  PlanningCategory,
  PlanningPriority,
  PlanningStatus,
  PlanningTask,
} from '@/lib/planning/types';
import { cn } from '@/lib/utils';

const statusLabels: Record<PlanningStatus, string> = {
  idea: 'Idées',
  todo: 'À faire',
  doing: 'En cours',
  waiting: 'En attente',
  done: 'Terminé',
};

const statusOrder: PlanningStatus[] = ['idea', 'todo', 'doing', 'waiting', 'done'];

const categoryLabels: Record<PlanningCategory, string> = {
  blog: 'Blog',
  product: 'Produit',
  '3d': '3D / proto',
  marketing: 'Marketing',
  site: 'Site web',
  admin: 'Admin',
  event: 'Événement',
};

const categoryOrder: PlanningCategory[] = [
  'blog',
  'product',
  '3d',
  'marketing',
  'site',
  'admin',
  'event',
];

const priorityLabels: Record<PlanningPriority, string> = {
  low: 'Basse',
  medium: 'Moyenne',
  high: 'Haute',
};

const emptyTask = (): PlanningTask => {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    category: 'admin',
    dueDate: '',
    publishDate: '',
    budget: '',
    feasibility: '',
    link: '',
    checklist: [],
    createdAt: now,
    updatedAt: now,
  };
};

function formatDate(date: string) {
  if (!date) return '';
  return new Date(`${date}T12:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function isOverdue(task: PlanningTask) {
  if (!task.dueDate || task.status === 'done') return false;
  const today = new Date().toISOString().slice(0, 10);
  return task.dueDate < today;
}

function taskSearchText(task: PlanningTask) {
  return [
    task.title,
    task.description,
    task.budget,
    task.feasibility,
    statusLabels[task.status],
    categoryLabels[task.category],
  ]
    .join(' ')
    .toLowerCase();
}

export function PlanningBoard({ initialTasks }: { initialTasks: PlanningTask[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');
  const [category, setCategory] = useState<'all' | PlanningCategory>('all');
  const [query, setQuery] = useState('');
  const [editingTask, setEditingTask] = useState<PlanningTask | null>(null);
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const categoryMatch = category === 'all' || task.category === category;
      const queryMatch = !normalizedQuery || taskSearchText(task).includes(normalizedQuery);
      return categoryMatch && queryMatch;
    });
  }, [category, query, tasks]);

  const stats = useMemo(
    () => ({
      week: tasks.filter((task) => task.status !== 'done' && task.status !== 'idea').length,
      overdue: tasks.filter(isOverdue).length,
      doing: tasks.filter((task) => task.status === 'doing').length,
      soon: tasks.filter((task) => task.publishDate && task.status !== 'done').length,
    }),
    [tasks]
  );

  const persist = (nextTasks: PlanningTask[]) => {
    setMessage('');
    setTasks(nextTasks);
    startTransition(async () => {
      const result = await savePlanningTasks(nextTasks);
      setMessage(result.success ? 'Planning enregistré.' : result.error || 'Erreur enregistrement.');
    });
  };

  const updateTask = (task: PlanningTask) => {
    const stamped = { ...task, updatedAt: new Date().toISOString() };
    persist(tasks.map((item) => (item.id === stamped.id ? stamped : item)));
    setEditingTask(null);
  };

  const removeTask = (id: string) => {
    persist(tasks.filter((task) => task.id !== id));
    setEditingTask(null);
  };

  const moveTask = (task: PlanningTask, status: PlanningStatus) => {
    updateTask({ ...task, status });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-4">
        <StatCard label="Actives" value={stats.week} />
        <StatCard label="En retard" value={stats.overdue} tone={stats.overdue ? 'coral' : 'gray'} />
        <StatCard label="En cours" value={stats.doing} />
        <StatCard label="À publier" value={stats.soon} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher une tâche..."
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
              />
            </div>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as 'all' | PlanningCategory)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            >
              <option value="all">Toutes les catégories</option>
              {categoryOrder.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ViewButton active={view === 'board'} onClick={() => setView('board')} icon={LayoutGrid}>
              Tableau
            </ViewButton>
            <ViewButton active={view === 'list'} onClick={() => setView('list')} icon={List}>
              Liste
            </ViewButton>
            <ViewButton active={view === 'calendar'} onClick={() => setView('calendar')} icon={CalendarDays}>
              Calendrier
            </ViewButton>
            <button
              type="button"
              onClick={() => setEditingTask(emptyTask())}
              className="inline-flex items-center gap-2 rounded-lg bg-jungle-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jungle-700"
            >
              <Plus size={16} />
              Nouvelle tâche
            </button>
          </div>
        </div>
        {(message || isPending) && (
          <p className="mt-3 text-xs text-gray-500">
            {isPending ? 'Enregistrement...' : message}
          </p>
        )}
      </div>

      {view === 'board' && (
        <div className="grid gap-4 xl:grid-cols-5">
          {statusOrder.map((status) => {
            const columnTasks = filteredTasks.filter((task) => task.status === status);
            return (
              <section key={status} className="rounded-xl border border-gray-200 bg-gray-50/70 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-ink">{statusLabels[status]}</h2>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-500">
                    {columnTasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {columnTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={() => setEditingTask(task)}
                      onMove={(nextStatus) => moveTask(task, nextStatus)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {view === 'list' && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-3 border-b border-gray-100 p-4 last:border-b-0 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-ink">{task.title}</h3>
                  <Pill>{categoryLabels[task.category]}</Pill>
                  <Pill tone={task.priority === 'high' ? 'coral' : 'gray'}>
                    {priorityLabels[task.priority]}
                  </Pill>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-gray-500">{task.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={task.status}
                  onChange={(event) => moveTask(task, event.target.value as PlanningStatus)}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs"
                >
                  {statusOrder.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setEditingTask(task)}
                  className="rounded-lg bg-gray-50 p-2 text-gray-500 transition hover:bg-gray-100 hover:text-ink"
                  aria-label="Modifier"
                >
                  <Edit3 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'calendar' && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredTasks
            .filter((task) => task.dueDate || task.publishDate)
            .sort((a, b) => (a.dueDate || a.publishDate).localeCompare(b.dueDate || b.publishDate))
            .map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => setEditingTask(task)}
                className="rounded-xl border border-gray-200 bg-white p-4 text-left transition hover:border-jungle-300 hover:shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {task.publishDate ? `Publication ${formatDate(task.publishDate)}` : `Deadline ${formatDate(task.dueDate)}`}
                </p>
                <h3 className="mt-2 font-semibold text-ink">{task.title}</h3>
                <p className="mt-1 text-sm text-gray-500">{categoryLabels[task.category]}</p>
              </button>
            ))}
        </div>
      )}

      {editingTask && (
        <TaskEditor
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onDelete={() => removeTask(editingTask.id)}
          onSave={updateTask}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone = 'jungle' }: { label: string; value: number; tone?: 'jungle' | 'coral' | 'gray' }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</p>
      <p className={cn('mt-2 text-2xl font-black', tone === 'coral' ? 'text-coral-600' : 'text-ink')}>
        {value}
      </p>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
        active ? 'bg-ink text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
      )}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

function Pill({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'coral' | 'jungle' }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
        tone === 'coral' && 'bg-coral-100 text-coral-700',
        tone === 'jungle' && 'bg-jungle-100 text-jungle-700',
        tone === 'gray' && 'bg-gray-100 text-gray-500'
      )}
    >
      {children}
    </span>
  );
}

function TaskCard({
  task,
  onEdit,
  onMove,
}: {
  task: PlanningTask;
  onEdit: () => void;
  onMove: (status: PlanningStatus) => void;
}) {
  const doneItems = task.checklist.filter((item) => item.done).length;
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-bold text-ink">{task.title}</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone="jungle">{categoryLabels[task.category]}</Pill>
            <Pill tone={task.priority === 'high' ? 'coral' : 'gray'}>{priorityLabels[task.priority]}</Pill>
          </div>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-ink"
          aria-label="Modifier"
        >
          <Edit3 size={14} />
        </button>
      </div>

      {task.description && (
        <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-gray-500">{task.description}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
        {task.dueDate && (
          <span className={cn(isOverdue(task) && 'font-semibold text-coral-600')}>
            Deadline {formatDate(task.dueDate)}
          </span>
        )}
        {task.publishDate && <span>Publication {formatDate(task.publishDate)}</span>}
        {task.checklist.length > 0 && (
          <span className="inline-flex items-center gap-1">
            <ClipboardList size={13} />
            {doneItems}/{task.checklist.length}
          </span>
        )}
      </div>

      <select
        value={task.status}
        onChange={(event) => onMove(event.target.value as PlanningStatus)}
        className="mt-3 w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600"
      >
        {statusOrder.map((status) => (
          <option key={status} value={status}>
            {statusLabels[status]}
          </option>
        ))}
      </select>
    </article>
  );
}

function TaskEditor({
  task,
  onClose,
  onDelete,
  onSave,
}: {
  task: PlanningTask;
  onClose: () => void;
  onDelete: () => void;
  onSave: (task: PlanningTask) => void;
}) {
  const [draft, setDraft] = useState(task);
  const [checklistInput, setChecklistInput] = useState('');

  const setField = <K extends keyof PlanningTask>(field: K, value: PlanningTask[K]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const addChecklistItem = () => {
    const label = checklistInput.trim();
    if (!label) return;
    setDraft((current) => ({
      ...current,
      checklist: [...current.checklist, { id: crypto.randomUUID(), label, done: false }],
    }));
    setChecklistInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[calc(100vh-2rem)] max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="font-bold text-ink">{task.title ? 'Modifier la tâche' : 'Nouvelle tâche'}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-50">
            <X size={18} />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto p-5 md:grid-cols-2">
          <Field label="Titre" className="md:col-span-2">
            <input
              value={draft.title}
              onChange={(event) => setField('title', event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            />
          </Field>

          <Field label="Description / notes" className="md:col-span-2">
            <textarea
              rows={5}
              value={draft.description}
              onChange={(event) => setField('description', event.target.value)}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            />
          </Field>

          <Field label="Statut">
            <select
              value={draft.status}
              onChange={(event) => setField('status', event.target.value as PlanningStatus)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {statusOrder.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Catégorie">
            <select
              value={draft.category}
              onChange={(event) => setField('category', event.target.value as PlanningCategory)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              {categoryOrder.map((item) => (
                <option key={item} value={item}>
                  {categoryLabels[item]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Priorité">
            <select
              value={draft.priority}
              onChange={(event) => setField('priority', event.target.value as PlanningPriority)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </select>
          </Field>

          <Field label="Budget">
            <input
              value={draft.budget}
              onChange={(event) => setField('budget', event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            />
          </Field>

          <Field label="Date limite">
            <input
              type="date"
              value={draft.dueDate}
              onChange={(event) => setField('dueDate', event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Publication prévue">
            <input
              type="date"
              value={draft.publishDate}
              onChange={(event) => setField('publishDate', event.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Lien associé">
            <input
              value={draft.link}
              onChange={(event) => setField('link', event.target.value)}
              placeholder="/admin/blog"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            />
          </Field>

          <Field label="Notes faisabilité" className="md:col-span-2">
            <textarea
              rows={3}
              value={draft.feasibility}
              onChange={(event) => setField('feasibility', event.target.value)}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
            />
          </Field>

          <Field label="Checklist" className="md:col-span-2">
            <div className="space-y-2 rounded-xl border border-gray-200 p-3">
              {draft.checklist.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={item.done}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        checklist: current.checklist.map((entry) =>
                          entry.id === item.id ? { ...entry, done: event.target.checked } : entry
                        ),
                      }))
                    }
                    className="rounded border-gray-300 text-jungle-600 focus:ring-jungle-500"
                  />
                  <span className="flex-1">{item.label}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft((current) => ({
                        ...current,
                        checklist: current.checklist.filter((entry) => entry.id !== item.id),
                      }))
                    }
                    className="text-gray-300 hover:text-coral-600"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={14} />
                  </button>
                </label>
              ))}
              <div className="flex gap-2">
                <input
                  value={checklistInput}
                  onChange={(event) => setChecklistInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      addChecklistItem();
                    }
                  }}
                  placeholder="Ajouter une étape"
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-jungle-500 focus:ring-2 focus:ring-jungle-500/20"
                />
                <button
                  type="button"
                  onClick={addChecklistItem}
                  className="rounded-lg bg-gray-100 px-3 text-sm font-semibold text-gray-600 hover:bg-gray-200"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {draft.link && (
              <a
                href={draft.link}
                className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
              >
                <ExternalLink size={15} />
                Ouvrir le lien
              </a>
            )}
            <button
              type="button"
              onClick={onDelete}
              className="inline-flex items-center gap-2 rounded-lg bg-coral-50 px-3 py-2 text-sm font-semibold text-coral-700 hover:bg-coral-100"
            >
              <Trash2 size={15} />
              Supprimer
            </button>
          </div>

          <button
            type="button"
            onClick={() => onSave(draft)}
            disabled={!draft.title.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-jungle-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-jungle-700 disabled:opacity-50"
          >
            {task.title ? <Save size={16} /> : <Check size={16} />}
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 block text-sm font-semibold text-gray-700">{label}</span>
      {children}
    </label>
  );
}
