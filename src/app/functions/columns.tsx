import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Column } from '../lib/types';

const apiClient = {
  getCols: async (): Promise<Column[]> => {
    const url = '/api/columns';
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  createCol: async (title: string): Promise<Column> => {
    const response = await fetch('/api/columns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }), // Wrap the title in an object
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },

  updateCol: async ({ id, data }: { id: string; data: Partial<Column> }): Promise<Column> => {
    const response = await fetch(`/api/columns/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  },

  deleteCol: async (id: string): Promise<void> => {
    const response = await fetch(`/api/columns/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
  },
};

export const queryKeys = {
  cols: {
    all: ['cols'] as const,
  },
};


export function useCols() {
  const queryClient = useQueryClient();

  const colsQuery = useQuery({
    queryKey: queryKeys.cols.all,
    queryFn: () => apiClient.getCols(),
  });

  // Fixed createCol mutation to handle proper payload
  const createColMutation = useMutation({
    mutationFn: (title: string) => apiClient.createCol(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cols.all });
    },
  });

  // Update col mutation
  const updateColMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Column> }) => 
      apiClient.updateCol({ id, data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cols.all });
    },
  });

  const deleteColMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteCol(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cols.all });
    },
  });

  return {
    cols: colsQuery.data || [],
    isLoading: colsQuery.isLoading,
    isError: colsQuery.isError,
    error: colsQuery.error,
    fetchCols: () => queryClient.invalidateQueries({ queryKey: queryKeys.cols.all }),
    createCol: createColMutation.mutate,
    updateCol: updateColMutation.mutate,
    deleteCol: deleteColMutation.mutate,
    createColAsync: createColMutation.mutateAsync,
    updateColAsync: updateColMutation.mutateAsync,
    deleteColAsync: deleteColMutation.mutateAsync,
  };
}
