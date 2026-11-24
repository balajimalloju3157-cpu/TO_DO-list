import { Task, TaskFilterState } from '../types/task';
import { isTaskDueToday, isTaskOverdue, isTaskUpcoming } from './dateUtils';

export function filterAndSortTasks(
  tasks: Task[],
  filters: TaskFilterState
): Task[] {
  const searchLower = filters.search.trim().toLowerCase();

  const filtered = tasks.filter((task) => {
    switch (filters.viewTab) {
      case 'my-tasks':
        if (task.status === 'Completed') return false;
        break;
      case 'today':
        if (!isTaskDueToday(task)) return false;
        break;
      case 'upcoming':
        if (!isTaskUpcoming(task)) return false;
        break;
      case 'overdue':
        if (!isTaskOverdue(task)) return false;
        break;
      case 'completed':
        if (task.status !== 'Completed') return false;
        break;
      case 'pending':
        if (task.status !== 'Pending') return false;
        break;
      case 'in-progress':
        if (task.status !== 'In Progress') return false;
        break;
      case 'all':
      default:
        break;
    }

    if (searchLower) {
      const titleMatch = task.title.toLowerCase().includes(searchLower);
      const descMatch = (task.description ?? '').toLowerCase().includes(searchLower);
      if (!titleMatch && !descMatch) return false;
    }

    if (filters.priority !== 'All' && task.priority !== filters.priority) {
      return false;
    }

    if (filters.status !== 'All' && task.status !== filters.status) {
      return false;
    }

    if (filters.category !== 'All') {
      const taskCategory = task.category?.trim() || 'Uncategorized';
      if (taskCategory !== filters.category) return false;
    }

    return true;
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sortBy) {
      case 'created_asc':
        return a.created_at.localeCompare(b.created_at);
      case 'due_asc': {
        if (!a.due_date && !b.due_date) return b.created_at.localeCompare(a.created_at);
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
        return (a.due_time ?? '23:59').localeCompare(b.due_time ?? '23:59');
      }
      case 'due_desc': {
        if (!a.due_date && !b.due_date) return b.created_at.localeCompare(a.created_at);
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        if (a.due_date !== b.due_date) return b.due_date.localeCompare(a.due_date);
        return (b.due_time ?? '00:00').localeCompare(a.due_time ?? '00:00');
      }
      case 'created_desc':
      default:
        return b.created_at.localeCompare(a.created_at);
    }
  });
}
