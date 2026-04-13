import { apiClient } from '../client';
import type { Subscription } from '@/shared/types';

export const billingApi = {
  getSubscription: () =>
    apiClient.get<Subscription | null>('/api/stripe/portal'),

  createCheckout: (priceId: string) =>
    apiClient.post<{ url: string }>('/api/stripe/checkout', { priceId }),

  getPortalUrl: () =>
    apiClient.post<{ url: string }>('/api/stripe/portal'),
};
