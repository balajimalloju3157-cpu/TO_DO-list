import { NavLink } from 'react-router-dom';
import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  X,
} from 'lucide-react';
import { DashboardMetrics } from '../types/task';

interface SidebarProps {
  open: boolean;
  metrics: DashboardMetrics;
  onClose: () => void;
}

export function Sidebar({ open, metrics, onClose }: SidebarProps) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, count: null },
    { to: '/tasks', label: 'All Tasks', icon: ListTodo, count: metrics.total },
    { to: '/today', label: "Today's Tasks", icon: CalendarDays, count: metrics.dueToday },
    { to: '/upcoming', label: 'Upcoming Tasks', icon: CalendarClock, count: null },
    { to: '/completed', label: 'Completed Tasks', icon: CheckCircle2, count: metrics.completed },
    { to: '/categories', label: 'Categories', icon: FolderKanban, count: null },
    { to: '/settings', label: 'Settings', icon: Settings, count: null },
  ];

  const navContent = (
    <div className="flex h-full flex-col justify-between bg-white px-4 py-5 dark:bg-slate-900">
      <div>
        <div className="flex items-center justify-between px-2 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5] text-sm font-bold text-white">
              T
            </div>
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Taskline
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Workspace navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex min-h-[40px] items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-indigo-50 text-[#4F46E5] dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-slate-100'
                  }`
                }
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.count !== null && (
                  <span className="font-mono text-xs text-slate-400 tabular-nums dark:text-slate-500">
                    {item.count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
        <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
          <span>Completion</span>
          <span className="font-mono tabular-nums">{metrics.completionRate}%</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
            style={{ width: `${metrics.completionRate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-slate-500 tabular-nums dark:text-slate-400">
          {metrics.completed} of {metrics.total} tasks done
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800">
        <div className="sticky top-0 h-screen">{navContent}</div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-[2px]"
            onClick={onClose}
          />
          <aside className="relative z-10 h-full w-72 max-w-[85vw] border-r border-slate-200 shadow-xl dark:border-slate-800">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
