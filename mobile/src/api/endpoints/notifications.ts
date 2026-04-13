import { apiClient } from '../client';
import type { Notification, NotificationPreference } from '@/shared/types';

export const notificationsApi = {
  getAll: () =>
    apiClient.get<Notification[]>('/api/user/notifications'),

  getPreferences: () =>
    apiClient.get<NotificationPreference>('/api/user/notifications/preferences'),

  updatePreferences: (data: Partial<NotificationPreference>) =>
    apiClient.put<NotificationPreference>('/api/user/notifications/preferences', data),
};
