import { apiClient } from '../client';
import type { Client } from '@/shared/types';

export const clientsApi = {
  getAll: () =>
    apiClient.get<Client[]>('/api/clients'),

  create: (data: Omit<Client, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    apiClient.post<Client>('/api/clients', data),
};
