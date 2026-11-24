import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Task, ViewMode } from '../types/task';
import {
  formatDisplayDate,
  formatDisplayTime,
  isTaskOverdue,
} from '../utils/dateUtils';
import { COMBINED_SETUP_SQL } from '../utils/sqlSnippets';
import { PriorityTag, StatusTag, TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  viewMode: ViewMode;
  mutatingIds: Record<string, boolean>;
  pageSize?: number;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry: () => void;
  onAddTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskList({
  tasks,
  loading,
  error,
  viewMode,
  mutatingIds,
  pageSize = 9,
  emptyTitle = 'No tasks match this view',
  emptyDescription = 'Create a new task or adjust your active filters to see tasks here.',
  onRetry,
  onAddTask,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskListProps) {
  const [currentPage, setCurrentPage] = useState(1);
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

  const totalPages = Math.max(1, Math.ceil(tasks.length / pageSize));

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTasks = tasks.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return viewMode === 'grid' ? (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="mt-3 h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800/70" />
            <div className="mt-5 h-10 w-full rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    ) : (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="flex h-14 animate-pulse items-center justify-between border-b border-slate-100 px-5 last:border-b-0 dark:border-slate-800"
          >
            <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/4 rounded bg-slate-100 dark:bg-slate-800/70" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    const isSchemaOrRlsError =
      error.includes('Supabase SQL Editor') || error.includes('"tasks" table');

    return (
      <div
        role="alert"
        className="flex flex-col items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50/70 p-6 sm:flex-row sm:items-center dark:border-red-900/60 dark:bg-red-950/30"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <div>
            <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
              Unable to load tasks from Supabase
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-red-700 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isSchemaOrRlsError && (
            <button
              type="button"
              onClick={handleCopySql}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800"
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
            onClick={onRetry}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <ClipboardList className="h-6 w-6" aria-hidden="true" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {emptyTitle}
        </h3>
        <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          {emptyDescription}
        </p>
        <button
          type="button"
          onClick={onAddTask}
          className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {paginatedTasks.map((task) => (
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
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <th className="w-12 py-3 pl-5 pr-2">Done</th>
                <th className="py-3 px-3">Task</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Priority</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Due Date</th>
                <th className="py-3 pl-3 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedTasks.map((task) => {
                const isCompleted = task.status === 'Completed';
                const overdue = isTaskOverdue(task);
                const isMutating = Boolean(mutatingIds[task.id]);

                return (
                  <tr
                    key={task.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 pl-5 pr-2 align-middle">
                      <button
                        type="button"
                        disabled={isMutating}
                        onClick={() => onToggleComplete(task)}
                        aria-label={
                          isCompleted
                            ? `Mark "${task.title}" as pending`
                            : `Mark "${task.title}" as completed`
                        }
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                          isCompleted
                            ? 'border-[#4F46E5] bg-[#4F46E5] text-white'
                            : 'border-slate-300 bg-white text-transparent hover:border-indigo-500 dark:border-slate-600 dark:bg-slate-950'
                        }`}
                      >
                        {isMutating ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden="true" />
                        )}
                      </button>
                    </td>
                    <td className="max-w-xs py-3.5 px-3 align-middle">
                      <p
                        className={`truncate text-sm font-medium ${
                          isCompleted
                            ? 'text-slate-400 line-through dark:text-slate-500'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-3 align-middle text-xs text-slate-600 dark:text-slate-400">
                      {task.category || 'Uncategorized'}
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <PriorityTag priority={task.priority} />
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <StatusTag status={task.status} />
                    </td>
                    <td className="py-3.5 px-3 align-middle">
                      <div
                        className={`inline-flex items-center gap-1.5 text-xs tabular-nums ${
                          overdue
                            ? 'font-medium text-red-600 dark:text-red-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {formatDisplayDate(task.due_date)}
                          {task.due_time ? ` · ${formatDisplayTime(task.due_time)}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 pl-3 pr-5 text-right align-middle">
                      <div className="inline-flex items-center justify-end gap-1">
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => onEdit(task)}
                          aria-label={`Edit "${task.title}"`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={isMutating}
                          onClick={() => onDelete(task)}
                          aria-label={`Delete "${task.title}"`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 dark:text-slate-400 dark:hover:bg-red-950/60 dark:hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {tasks.length > pageSize && (
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 sm:flex-row dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 tabular-nums dark:text-slate-400">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, tasks.length)} of{' '}
            {tasks.length} tasks
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            <span className="px-2 text-xs font-medium text-slate-700 tabular-nums dark:text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex min-h-[36px] items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
