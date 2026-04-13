import { apiClient } from '../client';
import type { Regulation, UserRegulation } from '@/shared/types';

export const regulationsApi = {
  getAll: (params?: { trades?: string; states?: string }) =>
    apiClient.get<Regulation[]>('/api/regulations', { params }),

  getUserRegulations: () =>
    apiClient.get<UserRegulation[]>('/api/user/regulations'),

  saveUserRegulations: (regulationIds: string[]) =>
    apiClient.post<{ success: boolean; count: number }>('/api/user/regulations', { regulationIds }),
};
