import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2.5 px-4 sm:px-0"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === 'success'
            ? CheckCircle2
            : toast.variant === 'error'
              ? AlertCircle
              : Info;

        const iconColor =
          toast.variant === 'success'
            ? 'text-emerald-600 dark:text-emerald-400'
            : toast.variant === 'error'
              ? 'text-red-600 dark:text-red-400'
              : 'text-indigo-600 dark:text-indigo-400';

        return (
          <div
            key={toast.id}
            role="status"
            className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lg transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {toast.title}
              </p>
              {toast.description && (
                <p className="mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-indigo-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
