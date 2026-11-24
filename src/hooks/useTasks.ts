import { useCallback, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured } from '../services/supabase';
import { taskService } from '../services/taskService';
import {
  CreateTaskInput,
  DashboardMetrics,
  Task,
  TaskStatus,
  UpdateTaskInput,
} from '../types/task';
import { isTaskDueToday, isTaskOverdue } from '../utils/dateUtils';
import { useToast } from './useToast';

export function useTasks(activeAccountId?: string | null) {
  const { showToast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);
  const [mutatingIds, setMutatingIds] = useState<Record<string, boolean>>({});

  const refreshTasks = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setTasks([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await taskService.fetchTasks();
      setTasks(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load tasks from Supabase.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const createTask = useCallback(
    async (input: CreateTaskInput): Promise<Task | null> => {
      try {
        const created = await taskService.createTask(input, activeAccountId);
        setTasks((prev) => [created, ...prev]);
        showToast('success', 'Task created', `"${created.title}" has been saved.`);
        return created;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not create task.';
        showToast('error', 'Failed to create task', message);
        throw err;
      }
    },
    [activeAccountId, showToast]
  );

  const updateTask = useCallback(
    async (taskId: string, input: UpdateTaskInput): Promise<Task | null> => {
      setMutatingIds((prev) => ({ ...prev, [taskId]: true }));
      try {
        const updated = await taskService.updateTask(taskId, input);
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        showToast('success', 'Task updated', `"${updated.title}" has been updated.`);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not update task.';
        showToast('error', 'Failed to update task', message);
        throw err;
      } finally {
        setMutatingIds((prev) => {
          const next = { ...prev };
          delete next[taskId];
          return next;
        });
      }
    },
    [showToast]
  );

  const toggleTaskCompletion = useCallback(
    async (task: Task): Promise<void> => {
      const nextStatus: TaskStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
      setMutatingIds((prev) => ({ ...prev, [task.id]: true }));
      try {
        const updated = await taskService.updateTask(task.id, { status: nextStatus });
        setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
        showToast(
          'success',
          nextStatus === 'Completed' ? 'Task completed' : 'Task reopened',
          `"${updated.title}" marked as ${nextStatus}.`
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not update status.';
        showToast('error', 'Status update failed', message);
      } finally {
        setMutatingIds((prev) => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });
      }
    },
    [showToast]
  );

  const deleteTask = useCallback(
    async (task: Task): Promise<boolean> => {
      setMutatingIds((prev) => ({ ...prev, [task.id]: true }));
      try {
        await taskService.deleteTask(task.id);
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        showToast('success', 'Task deleted', `"${task.title}" was permanently removed.`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Could not delete task.';
        showToast('error', 'Delete failed', message);
        return false;
      } finally {
        setMutatingIds((prev) => {
          const next = { ...prev };
          delete next[task.id];
          return next;
        });
      }
    },
    [showToast]
  );

  const metrics: DashboardMetrics = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'Completed').length;
    const pending = tasks.filter((t) => t.status === 'Pending').length;
    const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
    const overdue = tasks.filter((t) => isTaskOverdue(t)).length;
    const dueToday = tasks.filter((t) => isTaskDueToday(t)).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      inProgress,
      overdue,
      dueToday,
      completionRate,
    };
  }, [tasks]);

  const categories: string[] = useMemo(() => {
    const unique = new Set<string>();
    for (const task of tasks) {
      if (task.category && task.category.trim()) {
        unique.add(task.category.trim());
      }
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [tasks]);

  return {
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
  };
}
