export type PlanningStatus = 'idea' | 'todo' | 'doing' | 'waiting' | 'done';
export type PlanningPriority = 'low' | 'medium' | 'high';
export type PlanningCategory =
  | 'blog'
  | 'product'
  | '3d'
  | 'marketing'
  | 'site'
  | 'admin'
  | 'event';

export type PlanningTask = {
  id: string;
  title: string;
  description: string;
  status: PlanningStatus;
  priority: PlanningPriority;
  category: PlanningCategory;
  dueDate: string;
  publishDate: string;
  budget: string;
  feasibility: string;
  link: string;
  checklist: { id: string; label: string; done: boolean }[];
  createdAt: string;
  updatedAt: string;
};
