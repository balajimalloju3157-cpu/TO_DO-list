import { DashboardMetrics } from '../types/task';

interface DashboardStatsProps {
  metrics: DashboardMetrics;
  loading?: boolean;
}

export function DashboardStats({ metrics, loading = false }: DashboardStatsProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: metrics.total,
      hint: 'All workspace records',
      tone: 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Completed',
      value: metrics.completed,
      hint: `${metrics.completionRate}% completion rate`,
      tone: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pending',
      value: metrics.pending,
      hint: `${metrics.inProgress} in progress`,
      tone: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Overdue',
      value: metrics.overdue,
      hint: 'Past due date',
      tone: metrics.overdue > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100',
    },
    {
      label: 'Due Today',
      value: metrics.dueToday,
      hint: 'Scheduled for today',
      tone: 'text-indigo-600 dark:text-indigo-400',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {card.label}
            </p>
            {loading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className={`mt-2 text-3xl font-bold tracking-tight tabular-nums ${card.tone}`}>
                {card.value}
              </p>
            )}
            <p className="mt-1.5 text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {card.hint}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Overall Completion Progress
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Calculated directly from your Supabase task records
            </p>
          </div>
          <span className="font-mono text-lg font-bold text-[#4F46E5] tabular-nums dark:text-indigo-400">
            {metrics.completionRate}%
          </span>
        </div>

        <div
          className="mt-3.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          role="progressbar"
          aria-valuenow={metrics.completionRate}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Task completion percentage"
        >
          <div
            className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
            style={{ width: `${metrics.completionRate}%` }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 tabular-nums dark:text-slate-400">
          <span>{metrics.completed} completed</span>
          <span aria-hidden="true">·</span>
          <span>{metrics.inProgress} in progress</span>
          <span aria-hidden="true">·</span>
          <span>{metrics.pending} pending</span>
        </div>
      </div>
    </div>
  );
}
