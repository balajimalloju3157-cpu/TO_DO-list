import { Menu, Moon, Plus, Sun, UserPlus } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { UserAccount } from '../types/account';

interface NavbarProps {
  pageTitle: string;
  activeAccount: UserAccount | null;
  accountsLoading: boolean;
  onOpenCreateAccount: () => void;
  onOpenSidebar: () => void;
  onAddTask: () => void;
}

export function Navbar({
  pageTitle,
  activeAccount,
  accountsLoading,
  onOpenCreateAccount,
  onOpenSidebar,
  onAddTask,
}: NavbarProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const initial = activeAccount?.full_name.trim().charAt(0).toUpperCase() ?? '';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Open navigation menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 lg:hidden dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden text-slate-400 sm:inline dark:text-slate-500">Workspace</span>
          <span className="hidden text-slate-300 sm:inline dark:text-slate-700" aria-hidden="true">
            /
          </span>
          <h1 className="truncate font-display text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
            {pageTitle}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {activeAccount ? (
          <div
            title={activeAccount.email}
            className="flex min-h-[40px] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#4F46E5] text-xs font-semibold text-white">
              {initial}
            </div>
            <span className="max-w-[140px] truncate text-sm font-medium text-slate-900 dark:text-slate-100">
              {activeAccount.full_name}
            </span>
          </div>
        ) : !accountsLoading ? (
          <button
            type="button"
            onClick={onOpenCreateAccount}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <UserPlus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Create Account</span>
          </button>
        ) : null}

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={resolvedTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
        >
          {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onAddTask}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Add Task</span>
        </button>
      </div>
    </header>
  );
}
