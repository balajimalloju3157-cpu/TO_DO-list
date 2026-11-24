import { LayoutGrid, List, RotateCcw, Search } from 'lucide-react';
import {
  TaskFilterState,
  TaskPriority,
  TaskSortOption,
  TaskStatus,
  ViewMode,
} from '../types/task';

interface TaskFiltersProps {
  filters: TaskFilterState;
  categories: string[];
  viewMode: ViewMode;
  showStatusFilter?: boolean;
  onFilterChange: (patch: Partial<TaskFilterState>) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onReset: () => void;
}

export function TaskFilters({
  filters,
  categories,
  viewMode,
  showStatusFilter = true,
  onFilterChange,
  onViewModeChange,
  onReset,
}: TaskFiltersProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.priority !== 'All' ||
    (showStatusFilter && filters.status !== 'All') ||
    filters.category !== 'All' ||
    filters.sortBy !== 'created_desc';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1 lg:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search tasks by title or description..."
            aria-label="Search tasks by title or description"
            className="min-h-[40px] w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Filter by priority"
            value={filters.priority}
            onChange={(e) =>
              onFilterChange({ priority: e.target.value as 'All' | TaskPriority })
            }
            className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          {showStatusFilter && (
            <select
              aria-label="Filter by status"
              value={filters.status}
              onChange={(e) =>
                onFilterChange({ status: e.target.value as 'All' | TaskStatus })
              }
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) => onFilterChange({ category: e.target.value })}
            className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort tasks"
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value as TaskSortOption })}
            className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-indigo-600 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="created_desc">Newest First</option>
            <option value="created_asc">Oldest First</option>
            <option value="due_asc">Due Date (Earliest)</option>
            <option value="due_desc">Due Date (Latest)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          )}

          <div
            className="flex items-center rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950"
            role="group"
            aria-label="View layout"
          >
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-800 dark:text-indigo-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
