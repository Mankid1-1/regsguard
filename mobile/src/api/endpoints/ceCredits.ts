import { apiClient } from '../client';
import type { CECredit } from '@/shared/types';

export const ceCreditsApi = {
  getAll: () =>
    apiClient.get<CECredit[]>('/api/ce-credits'),

  getById: (id: string) =>
    apiClient.get<CECredit>(`/api/ce-credits/${id}`),

  create: (data: { courseName: string; provider?: string; hours: number; completedAt: string; expiresAt?: string; certificateUrl?: string; regulationId?: string; notes?: string }) =>
    apiClient.post<CECredit>('/api/ce-credits', data),

  update: (id: string, data: Partial<CECredit>) =>
    apiClient.patch<CECredit>(`/api/ce-credits/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/api/ce-credits/${id}`),
};
