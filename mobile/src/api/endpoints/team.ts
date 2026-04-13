import { apiClient } from '../client';
import type { TeamMember, Role } from '@/shared/types';

export const teamApi = {
  getAll: () =>
    apiClient.get<TeamMember[]>('/api/team'),

  add: (email: string, role: Role) =>
    apiClient.post<TeamMember>('/api/team', { email, role }),

  remove: (id: string) =>
    apiClient.delete(`/api/team/${id}`),
};
