import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Copy, Plus, RefreshCw } from 'lucide-react';
import { DashboardStats } from '../components/DashboardStats';
import { TaskCard } from '../components/TaskCard';
import { DashboardMetrics, Task } from '../types/task';
import { isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';
import { COMBINED_SETUP_SQL } from '../utils/sqlSnippets';

interface DashboardProps {
  tasks: Task[];
  metrics: DashboardMetrics;
  loading: boolean;
  error: string | null;
  mutatingIds: Record<string, boolean>;
  activeAccountName?: string | null;
  onRefresh: () => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function Dashboard({
  tasks,
  metrics,
  loading,
  error,
  mutatingIds,
  activeAccountName,
  onRefresh,
  onAddTask,
  onToggleComplete,
  onEdit,
  onDelete,
}: DashboardProps) {
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(COMBINED_SETUP_SQL);
      setCopiedSql(true);
      window.setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      setCopiedSql(false);
    }
  };

  const focusTasks = tasks
    .filter((task) => task.status !== 'Completed')
    .sort((a, b) => {
      const aOverdue = isTaskOverdue(a) ? 0 : isTaskDueToday(a) ? 1 : 2;
      const bOverdue = isTaskOverdue(b) ? 0 : isTaskDueToday(b) ? 1 : 2;
      if (aOverdue !== bOverdue) return aOverdue - bOverdue;
      if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      return b.created_at.localeCompare(a.created_at);
    })
    .slice(0, 6);

  const highPriorityCount = tasks.filter(
    (t) => t.priority === 'High' && t.status !== 'Completed'
  ).length;
  const mediumPriorityCount = tasks.filter(
    (t) => t.priority === 'Medium' && t.status !== 'Completed'
  ).length;
  const lowPriorityCount = tasks.filter(
    (t) => t.priority === 'Low' && t.status !== 'Completed'
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {activeAccountName ? `Welcome, ${activeAccountName}` : 'Workspace Overview'}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Track task progress, deadlines, and completion velocity in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
        >
          <p className="leading-relaxed">{error}</p>
          <div className="flex shrink-0 items-center gap-2">
            {(error.includes('Supabase SQL Editor') || error.includes('"tasks" table')) && (
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300"
              >
                {copiedSql ? (
                  <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{copiedSql ? 'Copied SQL' : 'Copy Setup SQL'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300"
            >
              <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      <DashboardStats metrics={metrics} loading={loading} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active High Priority
          </p>
          <p className="mt-1.5 text-2xl font-bold text-red-600 tabular-nums dark:text-red-400">
            {highPriorityCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Medium Priority
          </p>
          <p className="mt-1.5 text-2xl font-bold text-amber-600 tabular-nums dark:text-amber-400">
            {mediumPriorityCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Active Low Priority
          </p>
          <p className="mt-1.5 text-2xl font-bold text-slate-700 tabular-nums dark:text-slate-300">
            {lowPriorityCount}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Priority Queue
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Overdue and upcoming active tasks ordered by urgency
            </p>
          </div>
          <Link
            to="/tasks"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4F46E5] hover:underline dark:text-indigo-400"
          >
            <span>View all tasks</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-44 animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              />
            ))}
          </div>
        ) : focusTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
              {tasks.length === 0
                ? 'Your workspace is empty.'
                : 'All tasks are completed.'}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Create a new task to populate your priority queue.
            </p>
            <button
              type="button"
              onClick={onAddTask}
              className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {focusTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isMutating={Boolean(mutatingIds[task.id])}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
