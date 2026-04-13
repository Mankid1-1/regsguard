import { apiClient } from '../client';
import type { Project } from '@/shared/types';

export const projectsApi = {
  getAll: () =>
    apiClient.get<Project[]>('/api/projects'),

  create: (data: { name: string; clientId?: string; description?: string; address?: string; city?: string; state?: string; zip?: string; startDate?: string; endDate?: string; contractAmount?: number; permitNumber?: string }) =>
    apiClient.post<Project>('/api/projects', data),
};
