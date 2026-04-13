import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api/endpoints/auth';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { queryClient } from '@/utils/queryClient';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const loadPermissions = useUserStore((s) => s.loadPermissions);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: async (response) => {
      const { token, user } = response.data;
      await login(token, user);
      loadPermissions(user.role);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: ({ name, email, password, confirmPassword }: { name: string; email: string; password: string; confirmPassword: string }) =>
      authApi.signup(name, email, password, confirmPassword),
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await logout();
      queryClient.clear();
    },
  });
}
