'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/admin';
import { defaultPlanningTasks } from '@/lib/planning/default-tasks';
import type { PlanningTask } from '@/lib/planning/types';

const PLANNING_SETTINGS_KEY = 'admin_planning_tasks';

function normalizeTask(task: Partial<PlanningTask>, index: number): PlanningTask {
  const createdAt = task.createdAt || new Date().toISOString();
  return {
    id: task.id || crypto.randomUUID(),
    title: String(task.title || `Tâche ${index + 1}`),
    description: String(task.description || ''),
    status: task.status || 'todo',
    priority: task.priority || 'medium',
    category: task.category || 'admin',
    dueDate: String(task.dueDate || ''),
    publishDate: String(task.publishDate || ''),
    budget: String(task.budget || ''),
    feasibility: String(task.feasibility || ''),
    link: String(task.link || ''),
    checklist: Array.isArray(task.checklist)
      ? task.checklist.map((item) => ({
          id: item.id || crypto.randomUUID(),
          label: String(item.label || ''),
          done: Boolean(item.done),
        }))
      : [],
    createdAt,
    updatedAt: task.updatedAt || createdAt,
  };
}

export async function getPlanningTasks(): Promise<PlanningTask[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('shop_settings')
    .select('value')
    .eq('key', PLANNING_SETTINGS_KEY)
    .maybeSingle();

  if (!data?.value) return defaultPlanningTasks;

  let raw = data.value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      return defaultPlanningTasks;
    }
  }

  if (!Array.isArray(raw)) return defaultPlanningTasks;
  return raw.map((task, index) => normalizeTask(task as Partial<PlanningTask>, index));
}

export async function savePlanningTasks(tasks: PlanningTask[]) {
  const supabase = createAdminClient();
  const cleanTasks = tasks.map((task, index) => normalizeTask(task, index));

  const { error } = await supabase
    .from('shop_settings')
    .upsert(
      {
        key: PLANNING_SETTINGS_KEY,
        value: cleanTasks,
      },
      { onConflict: 'key' }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/admin/planning');
  return { success: true };
}
