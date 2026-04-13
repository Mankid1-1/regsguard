import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/shared/rbac';

export function usePermission(permission: string): boolean {
  const role = useAuthStore((s) => s.user?.role);
  if (!role) return false;
  return hasPermission(role, permission);
}

export function useRole() {
  return useAuthStore((s) => s.user?.role);
}
