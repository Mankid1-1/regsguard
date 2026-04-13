"use client";

import { useUser } from "@clerk/nextjs";
import { hasPermission } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import type { ReactNode } from "react";

interface PermissionGateProps {
  /** The permission string to check, e.g. PERMISSIONS.MANAGE_TEAM */
  permission: string;
  /** Content rendered when the user has the required permission */
  children: ReactNode;
  /** Optional fallback rendered when the user lacks the permission */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the current user's role and a
 * required permission.
 *
 * Usage:
 *   <PermissionGate permission={PERMISSIONS.MANAGE_BILLING}>
 *     <BillingSettings />
 *   </PermissionGate>
 */
export function PermissionGate({
  permission,
  children,
  fallback = null,
}: PermissionGateProps) {
  const { user, isLoaded } = useUser();

  // While loading, render nothing to avoid flash
  if (!isLoaded) return null;

  // Not authenticated or no role — show fallback
  const role = user?.publicMetadata?.role as Role | undefined;
  if (!role) return <>{fallback}</>;

  if (hasPermission(role, permission)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
