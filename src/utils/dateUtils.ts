import { Task } from '../types/task';

/**
 * Returns local YYYY-MM-DD string for today.
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isTaskOverdue(task: Pick<Task, 'due_date' | 'due_time' | 'status'>): boolean {
  if (!task.due_date || task.status === 'Completed') return false;
  const today = getTodayDateString();
  if (task.due_date < today) return true;
  if (task.due_date === today && task.due_time) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return task.due_time.slice(0, 5) < currentTime;
  }
  return false;
}

export function isTaskDueToday(task: Pick<Task, 'due_date'>): boolean {
  if (!task.due_date) return false;
  return task.due_date === getTodayDateString();
}

export function isTaskUpcoming(task: Pick<Task, 'due_date' | 'status'>): boolean {
  if (!task.due_date || task.status === 'Completed') return false;
  return task.due_date > getTodayDateString();
}

export function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return 'No due date';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDisplayTime(timeStr: string | null): string {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = Number(hourStr);
  if (Number.isNaN(hour)) return timeStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalizedHour}:${minuteStr ?? '00'} ${period}`;
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
