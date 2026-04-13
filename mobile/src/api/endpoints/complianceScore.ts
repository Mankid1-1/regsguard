import { apiClient } from '../client';
import type { ComplianceScore } from '@/shared/types';

export const complianceScoreApi = {
  get: () =>
    apiClient.get<ComplianceScore>('/api/user/compliance-score'),
};
