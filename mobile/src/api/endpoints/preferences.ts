import { apiClient } from '../client';

export const preferencesApi = {
  update: (data: { darkMode?: boolean; locale?: string }) =>
    apiClient.put('/api/user/preferences', data),
};
