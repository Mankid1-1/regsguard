import { apiClient } from '../client';
import type { LoginResponse } from '@/shared/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>('/api/auth/mobile', { email, password }),

  signup: (name: string, email: string, password: string, confirmPassword: string) =>
    apiClient.post<{ message: string; userId: string }>('/api/auth/signup', {
      name,
      email,
      password,
      confirmPassword,
    }),
};
