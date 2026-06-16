import { getPlanningTasks } from '@/lib/actions/planning';
import { PlanningBoard } from './PlanningBoard';

export default async function PlanningPage() {
  const tasks = await getPlanningTasks();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Planning Island Dreams</h1>
        <p className="mt-1 text-sm text-gray-500">
          Pilotez les projets boutique, contenus, prototypes 3D, événements et actions marketing.
        </p>
      </div>

      <PlanningBoard initialTasks={tasks} />
    </div>
  );
}
