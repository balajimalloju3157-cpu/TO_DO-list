import { useMemo, useState } from 'react';
import { Folder, Plus } from 'lucide-react';
import { TaskList } from '../components/TaskList';
import { Task, ViewMode } from '../types/task';

interface CategoriesProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  mutatingIds: Record<string, boolean>;
  onRefresh: () => void;
  onAddTaskWithCategory: (category?: string) => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

interface CategorySummary {
  name: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export function Categories({
  tasks,
  loading,
  error,
  mutatingIds,
  onRefresh,
  onAddTaskWithCategory,
  onToggleComplete,
  onEdit,
  onDelete,
}: CategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const categorySummaries: CategorySummary[] = useMemo(() => {
    const groups = new Map<string, Task[]>();
    for (const task of tasks) {
      const key = task.category?.trim() || 'Uncategorized';
      const existing = groups.get(key) ?? [];
      existing.push(task);
      groups.set(key, existing);
    }

    return Array.from(groups.entries())
      .map(([name, groupTasks]) => {
        const total = groupTasks.length;
        const completed = groupTasks.filter((t) => t.status === 'Completed').length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { name, total, completed, pending, completionRate };
      })
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
  }, [tasks]);

  const activeCategoryTasks = useMemo(() => {
    if (!selectedCategory) return [];
    return tasks.filter(
      (task) => (task.category?.trim() || 'Uncategorized') === selectedCategory
    );
  }, [tasks, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Categories
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Organize and inspect tasks grouped by category from your Supabase records.
          </p>
        </div>

        {selectedCategory && selectedCategory !== 'Uncategorized' && (
          <button
            type="button"
            onClick={() => onAddTaskWithCategory(selectedCategory)}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add to {selectedCategory}</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            />
          ))}
        </div>
      ) : categorySummaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            No categories yet
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Assign a category when creating a task to group your work here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorySummaries.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() =>
                  setSelectedCategory((prev) => (prev === cat.name ? null : cat.name))
                }
                className={`rounded-xl border p-5 text-left transition-colors ${
                  isSelected
                    ? 'border-[#4F46E5] bg-indigo-50/40 dark:border-indigo-500 dark:bg-indigo-950/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Folder
                      className={`h-4 w-4 shrink-0 ${
                        isSelected
                          ? 'text-[#4F46E5] dark:text-indigo-400'
                          : 'text-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    <span className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
                    {cat.total} {cat.total === 1 ? 'task' : 'tasks'}
                  </span>
                </div>

                <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                    style={{ width: `${cat.completionRate}%` }}
                  />
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 tabular-nums dark:text-slate-400">
                  <span>
                    {cat.completed} done · {cat.pending} open
                  </span>
                  <span className="font-mono">{cat.completionRate}%</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedCategory && (
        <section className="space-y-4 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
                {selectedCategory}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Showing {activeCategoryTasks.length} tasks in this category
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode((m) => (m === 'grid' ? 'list' : 'grid'))}
                className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Switch to {viewMode === 'grid' ? 'List' : 'Grid'} View
              </button>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="min-h-[36px] rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Clear Selection
              </button>
            </div>
          </div>

          <TaskList
            tasks={activeCategoryTasks}
            loading={loading}
            error={error}
            viewMode={viewMode}
            mutatingIds={mutatingIds}
            onRetry={onRefresh}
            onAddTask={() =>
              onAddTaskWithCategory(
                selectedCategory !== 'Uncategorized' ? selectedCategory : undefined
              )
            }
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </section>
      )}
    </div>
  );
}
