import { requireAdmin } from '@/lib/auth/admin';
import { ScheduleDashboard } from './ScheduleDashboard';

export default async function PlanningPage() {
  await requireAdmin();
  return <ScheduleDashboard />;
}
