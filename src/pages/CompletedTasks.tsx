import { useMemo, useState } from 'react';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import { Task, TaskFilterState, ViewMode } from '../types/task';
import { filterAndSortTasks } from '../utils/taskFilterUtils';

interface CompletedTasksProps {
  tasks: Task[];
  categories: string[];
  loading: boolean;
  error: string | null;
  mutatingIds: Record<string, boolean>;
  onRefresh: () => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function CompletedTasks({
  tasks,
  categories,
  loading,
  error,
  mutatingIds,
  onRefresh,
  onAddTask,
  onToggleComplete,
  onEdit,
  onDelete,
}: CompletedTasksProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    priority: 'All',
    status: 'All',
    category: 'All',
    sortBy: 'created_desc',
    viewTab: 'completed',
  });

  const filteredTasks = useMemo(
    () => filterAndSortTasks(tasks, filters),
    [tasks, filters]
  );

  const handleFilterChange = (patch: Partial<TaskFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleReset = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      priority: 'All',
      status: 'All',
      category: 'All',
      sortBy: 'created_desc',
    }));
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Completed Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Archive of finished tasks. Uncheck any task to reopen it.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {filteredTasks.length} completed
        </span>
      </div>

      <TaskFilters
        filters={filters}
        categories={categories}
        viewMode={viewMode}
        showStatusFilter={false}
        onFilterChange={handleFilterChange}
        onViewModeChange={setViewMode}
        onReset={handleReset}
      />

      <TaskList
        tasks={filteredTasks}
        loading={loading}
        error={error}
        viewMode={viewMode}
        mutatingIds={mutatingIds}
        emptyTitle="No completed tasks yet"
        emptyDescription="Check off tasks as you finish them and they will appear here."
        onRetry={onRefresh}
        onAddTask={onAddTask}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
