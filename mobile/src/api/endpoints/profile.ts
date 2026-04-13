import { apiClient } from '../client';
import type { BusinessProfile } from '@/shared/types';
import type { BusinessProfileInput } from '@/shared/validators/profile';

export const profileApi = {
  get: () =>
    apiClient.get<BusinessProfile | null>('/api/user/profile'),

  update: (data: BusinessProfileInput) =>
    apiClient.put<BusinessProfile>('/api/user/profile', data),
};
