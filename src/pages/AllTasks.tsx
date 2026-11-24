import { useMemo, useState } from 'react';
import { TaskFilters } from '../components/TaskFilters';
import { TaskList } from '../components/TaskList';
import {
  Task,
  TaskFilterState,
  TaskViewTab,
  ViewMode,
} from '../types/task';
import { filterAndSortTasks } from '../utils/taskFilterUtils';

interface AllTasksProps {
  tasks: Task[];
  categories: string[];
  loading: boolean;
  error: string | null;
  mutatingIds: Record<string, boolean>;
  initialCategory?: string;
  onRefresh: () => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const VIEW_TABS: { id: TaskViewTab; label: string }[] = [
  { id: 'all', label: 'All Tasks' },
  { id: 'my-tasks', label: 'My Tasks' },
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'completed', label: 'Completed' },
  { id: 'pending', label: 'Pending' },
  { id: 'in-progress', label: 'In Progress' },
];

export function AllTasks({
  tasks,
  categories,
  loading,
  error,
  mutatingIds,
  initialCategory = 'All',
  onRefresh,
  onAddTask,
  onToggleComplete,
  onEdit,
  onDelete,
}: AllTasksProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<TaskFilterState>({
    search: '',
    priority: 'All',
    status: 'All',
    category: initialCategory,
    sortBy: 'created_desc',
    viewTab: 'all',
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
            All Tasks
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse, filter, sort, and update every task stored in Supabase.
          </p>
        </div>
        <span className="font-mono text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} shown
        </span>
      </div>

      <div
        className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900"
        role="tablist"
        aria-label="Task views"
      >
        {VIEW_TABS.map((tab) => {
          const isActive = filters.viewTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => handleFilterChange({ viewTab: tab.id })}
              className={`min-h-[36px] rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#4F46E5] text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <TaskFilters
        filters={filters}
        categories={categories}
        viewMode={viewMode}
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
        onRetry={onRefresh}
        onAddTask={onAddTask}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
