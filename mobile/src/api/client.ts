import axios from 'axios';
import { keychain } from '@/utils/keychain';

const API_URL = __DEV__ ? 'http://10.0.2.2:3000' : 'https://app.regsguard.com';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await keychain.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await keychain.clearToken();
      // The auth store listener will detect the missing token and redirect to login
    }
    return Promise.reject(error);
  }
);
