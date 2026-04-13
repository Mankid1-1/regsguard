import { apiClient } from '../client';
import type { ComplianceLog } from '@/shared/types';

export const complianceApi = {
  getLogs: () =>
    apiClient.get<ComplianceLog[]>('/api/compliance/share'),
};
