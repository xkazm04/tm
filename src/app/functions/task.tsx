import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '../lib/types';

const apiClient = {
  getTasks: async (filters?: { state?: string; assigned_to?: string }): Promise<Task[]> => {
    let url = '/api/tasks';
    
    if (filters) {
      const params = new URLSearchParams();
      if (filters.state) params.append('state', filters.state);
      if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  getTask: async (id: string): Promise<Task> => {
    const response = await fetch(`/api/tasks/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  createTask: async (task: Task): Promise<Task> => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  updateTask: async ({ id, data }: { id: string; data: Partial<Task> }): Promise<Task> => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  deleteTask: async (id: string): Promise<void> => {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  },
};

// Query keys for caching and invalidation
export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    filtered: (filters?: { state?: string; assigned_to?: string }) => 
      ['tasks', filters] as const,
    detail: (id: string) => ['tasks', id] as const,
  },
};


export function useTasks(filters?: { state?: string; assigned_to?: string }) {
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.filtered(filters),
    queryFn: () => apiClient.getTasks(filters),
  });

  const createTaskMutation = useMutation({
    mutationFn: (task: Task) => apiClient.createTask(task),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => 
      apiClient.updateTask({ id, data }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.tasks.detail(data.id!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteTask(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    fetchTasks: () => queryClient.invalidateQueries({ queryKey: queryKeys.tasks.filtered(filters) }),
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    createTaskAsync: createTaskMutation.mutateAsync,
    updateTaskAsync: updateTaskMutation.mutateAsync,
    deleteTaskAsync: deleteTaskMutation.mutateAsync,
  };
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id, 
  });
}