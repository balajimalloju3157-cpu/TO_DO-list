import React, { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';
import { formatTimestamp } from '../utils/dateUtils';

interface TaskFormProps {
  open: boolean;
  editingTask: Task | null;
  existingCategories: string[];
  defaultDueDate?: string;
  defaultCategory?: string;
  onClose: () => void;
  onSubmit: (data: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

const DEFAULT_CATEGORY_SUGGESTIONS = [
  'Work',
  'Personal',
  'Engineering',
  'Design',
  'Planning',
  'Operations',
];

export function TaskForm({
  open,
  editingTask,
  existingCategories,
  defaultDueDate,
  defaultCategory,
  onClose,
  onSubmit,
}: TaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('Medium');
  const [status, setStatus] = useState<TaskStatus>('Pending');
  const [category, setCategory] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [titleError, setTitleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description ?? '');
      setPriority(editingTask.priority);
      setStatus(editingTask.status);
      setCategory(editingTask.category ?? '');
      setDueDate(editingTask.due_date ?? '');
      setDueTime(editingTask.due_time ? editingTask.due_time.slice(0, 5) : '');
    } else {
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setStatus('Pending');
      setCategory(defaultCategory ?? '');
      setDueDate(defaultDueDate ?? '');
      setDueTime('');
    }
    setTitleError(null);
    setSubmitError(null);
    setIsSubmitting(false);
  }, [open, editingTask, defaultDueDate, defaultCategory]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, isSubmitting, onClose]);

  if (!open) return null;

  const categorySuggestions = Array.from(
    new Set([...existingCategories, ...DEFAULT_CATEGORY_SUGGESTIONS])
  ).sort((a, b) => a.localeCompare(b));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setTitleError('Task title is required.');
      return;
    }
    if (trimmedTitle.length > 200) {
      setTitleError('Task title must be 200 characters or fewer.');
      return;
    }

    setTitleError(null);
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        title: trimmedTitle,
        description: description.trim() ? description.trim() : null,
        priority,
        status,
        category: category.trim() ? category.trim() : null,
        due_date: dueDate || null,
        due_time: dueTime || null,
      });
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Unable to save task. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-form-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <div>
            <h2
              id="task-form-title"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {editingTask
                ? 'Update task details and sync changes to Supabase.'
                : 'Add a new task directly to your Supabase workspace.'}
            </p>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Close task form"
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
          {submitError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-300"
            >
              {submitError}
            </div>
          )}

          <div>
            <label
              htmlFor="task-title"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Task Title <span className="text-red-600 dark:text-red-400">*</span>
            </label>
            <input
              id="task-title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError(null);
              }}
              placeholder="e.g., Finalize Q4 product roadmap"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
            />
            {titleError && (
              <p className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {titleError}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Description
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add acceptance criteria, notes, or context..."
              className="mt-1.5 w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-priority"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="task-status"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-due-date"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
              />
            </div>

            <div>
              <label
                htmlFor="task-due-time"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Due Time <span className="text-xs font-normal text-slate-400">(optional)</span>
              </label>
              <input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="task-category"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Category
            </label>
            <input
              id="task-category"
              type="text"
              list="task-category-suggestions"
              maxLength={60}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., Engineering, Personal, Finance"
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500"
            />
            <datalist id="task-category-suggestions">
              {categorySuggestions.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {categorySuggestions.slice(0, 6).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCategory(preset)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    category.toLowerCase() === preset.toLowerCase()
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {editingTask && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
              <span>Created {formatTimestamp(editingTask.created_at)}</span>
              <span>Updated {formatTimestamp(editingTask.updated_at)}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="min-h-[40px] rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>
                {isSubmitting
                  ? editingTask
                    ? 'Saving...'
                    : 'Creating...'
                  : editingTask
                    ? 'Save Changes'
                    : 'Create Task'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
