import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ConfirmDialog } from './components/ConfirmDialog';
import { CreateAccountModal } from './components/CreateAccountModal';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { SupabaseSetupGuide } from './components/SupabaseSetupGuide';
import { TaskForm } from './components/TaskForm';
import { ToastContainer } from './components/ToastContainer';
import { useAccounts } from './hooks/useAccounts';
import { useTasks } from './hooks/useTasks';
import { ThemeProvider } from './hooks/useTheme';
import { ToastProvider, useToast } from './hooks/useToast';
import { AllTasks } from './pages/AllTasks';
import { Categories } from './pages/Categories';
import { CompletedTasks } from './pages/CompletedTasks';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { TodayTasks } from './pages/TodayTasks';
import { UpcomingTasks } from './pages/UpcomingTasks';
import { isSupabaseConfigured, loadRuntimeSupabaseConfig } from './services/supabase';
import { CreateTaskInput, Task, UpdateTaskInput } from './types/task';
import { getTodayDateString } from './utils/dateUtils';

const ROUTE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/tasks': 'All Tasks',
  '/today': "Today's Tasks",
  '/upcoming': 'Upcoming Tasks',
  '/completed': 'Completed Tasks',
  '/categories': 'Categories',
  '/settings': 'Settings',
};

function WorkspaceShell({
  supabaseConfigured,
  retryingConfig,
  onRetryConfig,
}: {
  supabaseConfigured: boolean;
  retryingConfig: boolean;
  onRetryConfig: () => void;
}) {
  const location = useLocation();
  const { showToast } = useToast();
  const {
    accounts,
    activeAccount,
    loading: accountsLoading,
    setActiveAccountId,
    createAccount,
    deleteAccount,
  } = useAccounts();

  const {
    tasks,
    loading,
    error,
    mutatingIds,
    metrics,
    categories,
    refreshTasks,
    createTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
  } = useTasks(activeAccount?.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [createAccountOpen, setCreateAccountOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDueDate, setDefaultDueDate] = useState<string | undefined>(undefined);
  const [defaultCategory, setDefaultCategory] = useState<string | undefined>(undefined);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const pageTitle = supabaseConfigured
    ? ROUTE_TITLES[location.pathname] ?? 'Dashboard'
    : 'Supabase Setup';

  const requireConfigured = () => {
    if (!supabaseConfigured) {
      showToast(
        'error',
        'Supabase not connected',
        'Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment first.'
      );
      return false;
    }
    return true;
  };

  const openCreateModal = (options?: { dueDate?: string; category?: string }) => {
    if (!requireConfigured()) return;
    setEditingTask(null);
    setDefaultDueDate(options?.dueDate);
    setDefaultCategory(options?.category);
    setFormOpen(true);
  };

  const openEditModal = (task: Task) => {
    if (!requireConfigured()) return;
    setEditingTask(task);
    setDefaultDueDate(undefined);
    setDefaultCategory(undefined);
    setFormOpen(true);
  };

  const handleOpenCreateAccount = () => {
    if (!requireConfigured()) return;
    setCreateAccountOpen(true);
  };

  const handleFormSubmit = async (payload: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      await updateTask(editingTask.id, payload as UpdateTaskInput);
    } else {
      await createTask(payload as CreateTaskInput);
    }
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete || deleting) return;
    setDeleting(true);
    const removed = await deleteTask(taskToDelete);
    setDeleting(false);
    if (removed) {
      setTaskToDelete(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-slate-900 dark:bg-[#0F172A] dark:text-slate-100">
      <Sidebar
        open={sidebarOpen}
        metrics={metrics}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          pageTitle={pageTitle}
          activeAccount={activeAccount}
          accountsLoading={accountsLoading}
          onOpenCreateAccount={handleOpenCreateAccount}
          onOpenSidebar={() => setSidebarOpen(true)}
          onAddTask={() =>
            openCreateModal(
              location.pathname === '/today' ? { dueDate: getTodayDateString() } : undefined
            )
          }
        />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {!supabaseConfigured ? (
            <SupabaseSetupGuide onRetry={onRetryConfig} retrying={retryingConfig} />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    tasks={tasks}
                    metrics={metrics}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    activeAccountName={activeAccount?.full_name}
                    onRefresh={refreshTasks}
                    onAddTask={() => openCreateModal()}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/tasks"
                element={
                  <AllTasks
                    tasks={tasks}
                    categories={categories}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    onRefresh={refreshTasks}
                    onAddTask={() => openCreateModal()}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/today"
                element={
                  <TodayTasks
                    tasks={tasks}
                    categories={categories}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    onRefresh={refreshTasks}
                    onAddTask={() => openCreateModal({ dueDate: getTodayDateString() })}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/upcoming"
                element={
                  <UpcomingTasks
                    tasks={tasks}
                    categories={categories}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    onRefresh={refreshTasks}
                    onAddTask={() => openCreateModal()}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/completed"
                element={
                  <CompletedTasks
                    tasks={tasks}
                    categories={categories}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    onRefresh={refreshTasks}
                    onAddTask={() => openCreateModal()}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/categories"
                element={
                  <Categories
                    tasks={tasks}
                    loading={loading}
                    error={error}
                    mutatingIds={mutatingIds}
                    onRefresh={refreshTasks}
                    onAddTaskWithCategory={(category) => openCreateModal({ category })}
                    onToggleComplete={toggleTaskCompletion}
                    onEdit={openEditModal}
                    onDelete={(task) => setTaskToDelete(task)}
                  />
                }
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    accounts={accounts}
                    activeAccount={activeAccount}
                    accountsLoading={accountsLoading}
                    onOpenCreateAccount={handleOpenCreateAccount}
                    onSelectAccount={(id) => setActiveAccountId(id)}
                    onDeleteAccount={deleteAccount}
                  />
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </main>
      </div>

      <TaskForm
        open={formOpen}
        editingTask={editingTask}
        existingCategories={categories}
        defaultDueDate={defaultDueDate}
        defaultCategory={defaultCategory}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      <CreateAccountModal
        open={createAccountOpen}
        onClose={() => setCreateAccountOpen(false)}
        onCreate={async (input) => {
          await createAccount(input);
        }}
      />

      <ConfirmDialog
        open={taskToDelete !== null}
        title="Delete task permanently?"
        description={
          taskToDelete
            ? `This will permanently remove "${taskToDelete.title}" from Supabase. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete Task"
        isLoading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deleting) setTaskToDelete(null);
        }}
      />
    </div>
  );
}

function AppBootstrap() {
  const [configured, setConfigured] = useState<boolean>(() => isSupabaseConfigured());
  const [checkingConfig, setCheckingConfig] = useState<boolean>(() => !isSupabaseConfigured());
  const [retryingConfig, setRetryingConfig] = useState<boolean>(false);

  const checkRuntimeConfig = async (isRetry = false) => {
    if (isRetry) {
      setRetryingConfig(true);
    }
    try {
      const ok = await loadRuntimeSupabaseConfig();
      setConfigured(ok);
    } finally {
      setCheckingConfig(false);
      setRetryingConfig(false);
    }
  };

  useEffect(() => {
    if (configured) return;
    let active = true;
    loadRuntimeSupabaseConfig()
      .then((ok) => {
        if (!active) return;
        setConfigured(ok);
        setCheckingConfig(false);
      })
      .catch(() => {
        if (!active) return;
        setCheckingConfig(false);
      });
    return () => {
      active = false;
    };
  }, [configured]);

  if (checkingConfig) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#F8FAFC] text-slate-600 dark:bg-[#0F172A] dark:text-slate-300">
        <Loader2 className="h-6 w-6 animate-spin text-[#4F46E5]" />
        <p className="text-sm font-medium">Loading workspace...</p>
      </div>
    );
  }

  return (
    <WorkspaceShell
      key={configured ? 'configured' : 'setup'}
      supabaseConfigured={configured}
      retryingConfig={retryingConfig}
      onRetryConfig={() => void checkRuntimeConfig(true)}
    />
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppBootstrap />
          <ToastContainer />
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
