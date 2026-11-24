import { getSupabaseClient } from './supabase';
import { CreateTaskInput, Task, UpdateTaskInput } from '../types/task';

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }
  return client;
}

function formatSupabaseError(error: { message: string; code?: string; hint?: string | null }): Error {
  const msg = error.message ?? '';
  if (error.code === '42P01' || error.code === 'PGRST205' || msg.includes('schema cache')) {
    return new Error(
      'The "tasks" table does not exist in your Supabase database yet. Click "Copy Setup SQL", run it in your Supabase SQL Editor, then click Retry.'
    );
  }
  if (error.code === '42501') {
    if (msg.toLowerCase().includes('permission denied for table')) {
      return new Error(
        'Table permissions for the Supabase anon role are missing. Click "Copy Setup SQL", run it in your Supabase SQL Editor, then click Retry.'
      );
    }
    return new Error(
      'Permission denied by Supabase Row Level Security. Click "Copy Setup SQL", run it in your Supabase SQL Editor, then click Retry.'
    );
  }
  if (msg.toLowerCase().includes('row-level security')) {
    return new Error(
      'Permission denied by Supabase Row Level Security. Click "Copy Setup SQL", run it in your Supabase SQL Editor, then click Retry.'
    );
  }
  if (error.code === '23502') {
    return new Error(
      'Database requires user_id to be nullable. Click "Copy Setup SQL", run it in your Supabase SQL Editor, then click Retry.'
    );
  }
  return new Error(msg || 'An unexpected Supabase error occurred.');
}

export const taskService = {
  async fetchTasks(): Promise<Task[]> {
    const client = requireClient();
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw formatSupabaseError(error);
    }
    return (data ?? []) as Task[];
  },

  async createTask(input: CreateTaskInput, activeAccountId?: string | null): Promise<Task> {
    const client = requireClient();
    const payload = {
      user_id: activeAccountId || null,
      title: input.title.trim(),
      description: input.description?.trim() ? input.description.trim() : null,
      priority: input.priority,
      status: input.status,
      category: input.category?.trim() ? input.category.trim() : null,
      due_date: input.due_date || null,
      due_time: input.due_time || null,
    };

    const { data, error } = await client
      .from('tasks')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw formatSupabaseError(error);
    }
    return data as Task;
  },

  async updateTask(taskId: string, input: UpdateTaskInput): Promise<Task> {
    const client = requireClient();
    const payload: Record<string, string | null> = {};

    if (input.title !== undefined) {
      payload.title = input.title.trim();
    }
    if (input.description !== undefined) {
      payload.description = input.description?.trim() ? input.description.trim() : null;
    }
    if (input.priority !== undefined) {
      payload.priority = input.priority;
    }
    if (input.status !== undefined) {
      payload.status = input.status;
    }
    if (input.category !== undefined) {
      payload.category = input.category?.trim() ? input.category.trim() : null;
    }
    if (input.due_date !== undefined) {
      payload.due_date = input.due_date || null;
    }
    if (input.due_time !== undefined) {
      payload.due_time = input.due_time || null;
    }

    const { data, error } = await client
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .select()
      .single();

    if (error) {
      throw formatSupabaseError(error);
    }
    return data as Task;
  },

  async deleteTask(taskId: string): Promise<void> {
    const client = requireClient();
    const { error } = await client.from('tasks').delete().eq('id', taskId);

    if (error) {
      throw formatSupabaseError(error);
    }
  },
};
