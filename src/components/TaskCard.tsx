import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Loader2,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../types/task';
import {
  formatDisplayDate,
  formatDisplayTime,
  isTaskOverdue,
} from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  isMutating?: boolean;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function PriorityTag({ priority }: { priority: TaskPriority }) {
  const styles: Record<TaskPriority, string> = {
    High: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60',
    Medium:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60',
    Low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[priority]}`}
    >
      {priority} Priority
    </span>
  );
}

export function StatusTag({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    Completed:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900/60',
    'In Progress':
      'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/60',
    Pending:
      'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const Icon =
    status === 'Completed' ? CheckCircle2 : status === 'In Progress' ? Clock : AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap ${styles[status]}`}
    >
      <Icon className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
}

export function TaskCard({
  task,
  isMutating = false,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const isCompleted = task.status === 'Completed';
  const overdue = isTaskOverdue(task);

  return (
    <article className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div>
        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled={isMutating}
            onClick={() => onToggleComplete(task)}
            aria-label={
              isCompleted ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`
            }
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
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

          <div className="min-w-0 flex-1">
            <h3
              className={`text-base font-semibold leading-snug ${
                isCompleted
                  ? 'text-slate-400 line-through dark:text-slate-500'
                  : 'text-slate-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span>{task.category || 'Uncategorized'}</span>
              <span aria-hidden="true">·</span>
              <span
                className={`inline-flex items-center gap-1 tabular-nums ${
                  overdue ? 'font-medium text-red-600 dark:text-red-400' : ''
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>
                  {formatDisplayDate(task.due_date)}
                  {task.due_time ? ` at ${formatDisplayTime(task.due_time)}` : ''}
                </span>
                {overdue && <span>(Overdue)</span>}
              </span>
            </div>
          </div>
        </div>

        {task.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            {task.description}
          </p>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <StatusTag status={task.status} />
          <PriorityTag priority={task.priority} />
        </div>

        <div className="flex items-center gap-1 shrink-0">
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
      </div>
    </article>
  );
}
