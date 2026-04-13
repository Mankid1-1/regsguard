import { apiClient } from '../client';
import type { DeadlinesResponse, DeadlineStatus } from '@/shared/types';

export const deadlinesApi = {
  getAll: (params?: { status?: DeadlineStatus; days?: number }) =>
    apiClient.get<DeadlinesResponse>('/api/user/deadlines', { params }),
};
