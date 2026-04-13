import React from 'react';
import { usePermission } from '@/hooks/usePermission';

interface PermissionGateProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const hasAccess = usePermission(permission);
  if (!hasAccess) return <>{fallback}</>;
  return <>{children}</>;
}
