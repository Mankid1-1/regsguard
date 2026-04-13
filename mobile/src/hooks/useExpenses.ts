import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi } from '@/api/endpoints/expenses';
import type { ExpenseCategory } from '@/shared/types';

export function useExpenses(params?: { projectId?: string; category?: ExpenseCategory }) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const response = await expensesApi.getAll(params);
      return response.data;
    },
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}
