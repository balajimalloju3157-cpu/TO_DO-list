export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export type TaskViewTab =
  | 'all'
  | 'my-tasks'
  | 'today'
  | 'upcoming'
  | 'overdue'
  | 'completed'
  | 'pending'
  | 'in-progress';

export type TaskSortOption =
  | 'created_desc'
  | 'created_asc'
  | 'due_asc'
  | 'due_desc';

export type ViewMode = 'grid' | 'list';

export interface Task {
  id: string;
  user_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string | null;
  due_date: string | null;
  due_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category?: string | null;
  due_date?: string | null;
  due_time?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  category?: string | null;
  due_date?: string | null;
  due_time?: string | null;
}

export interface TaskFilterState {
  search: string;
  priority: 'All' | TaskPriority;
  status: 'All' | TaskStatus;
  category: string;
  sortBy: TaskSortOption;
  viewTab: TaskViewTab;
}

export interface DashboardMetrics {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
}
