import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '../lib/types';
import { UserCreate } from '../lib/schemas';

const apiClient = {
  // Users
  getUsers: async (): Promise<User[]> => {
    const response = await fetch('/api/users');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  getUser: async (id: string): Promise<User> => {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return response.json();
  },

  createUser: async (user: UserCreate): Promise<UserCreate> => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  },

  updateUser: async ({ id, data }: { id: string; data: Partial<User> }): Promise<User> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
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

  deleteUser: async (id: string): Promise<void> => {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  }
}

export const queryKeys = {
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
  },
};

export function useUsers() {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: () => apiClient.getUsers(),
    staleTime: 30000, 
  });

  const createUserMutation = useMutation({
    mutationFn: (user: UserCreate) => apiClient.createUser(user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      apiClient.updateUser({ id, data }),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.users.detail(data.id!), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  return {
    users: usersQuery.data || [],
    isLoading: usersQuery.isLoading,
    isError: usersQuery.isError,
    error: usersQuery.error,
    fetchUsers: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
    createUser: createUserMutation.mutate,
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    createUserAsync: createUserMutation.mutateAsync,
    updateUserAsync: updateUserMutation.mutateAsync,
    deleteUserAsync: deleteUserMutation.mutateAsync,
  };
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => apiClient.getUser(id),
    enabled: !!id,
    staleTime: 30000, 
  });
}