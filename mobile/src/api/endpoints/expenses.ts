import { apiClient } from '../client';
import type { Expense, ExpenseCategory } from '@/shared/types';

export const expensesApi = {
  getAll: (params?: { projectId?: string; category?: ExpenseCategory }) =>
    apiClient.get<Expense[]>('/api/expenses', { params }),

  getById: (id: string) =>
    apiClient.get<Expense>(`/api/expenses/${id}`),

  create: (data: { category: ExpenseCategory; amount: number; description?: string; vendor?: string; date: string; projectId?: string }) =>
    apiClient.post<Expense>('/api/expenses', data),

  update: (id: string, data: Partial<Expense>) =>
    apiClient.patch<Expense>(`/api/expenses/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/expenses/${id}`),
};
