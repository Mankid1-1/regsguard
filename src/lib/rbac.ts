import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

// ─── Permission Constants ───

export const PERMISSIONS = {
  // Team
  MANAGE_TEAM: "manage:team",
  VIEW_TEAM: "view:team",

  // Billing & Account
  MANAGE_BILLING: "manage:billing",
  DELETE_ACCOUNT: "delete:account",

  // Documents
  MANAGE_DOCUMENTS: "manage:documents",
  VIEW_DOCUMENTS: "view:documents",

  // Deadlines
  MANAGE_DEADLINES: "manage:deadlines",
  VIEW_DEADLINES: "view:deadlines",
  VIEW_OWN_DEADLINES: "view:own-deadlines",

  // Projects
  MANAGE_PROJECTS: "manage:projects",
  VIEW_PROJECTS: "view:projects",

  // Data / Reporting
  EXPORT_DATA: "export:data",
  EXPORT_REPORTS: "export:reports",

  // Photos & Notes
  UPLOAD_PHOTOS: "upload:photos",
  ADD_NOTES: "add:notes",

  // Financial
  VIEW_INVOICES: "view:invoices",
  MANAGE_INVOICES: "manage:invoices",
  VIEW_EXPENSES: "view:expenses",
  MANAGE_EXPENSES: "manage:expenses",

  // Regulations
  MANAGE_REGULATIONS: "manage:regulations",
  VIEW_REGULATIONS: "view:regulations",

  // Clients
  MANAGE_CLIENTS: "manage:clients",
  VIEW_CLIENTS: "view:clients",

  // API & Webhooks (Enterprise)
  MANAGE_API_KEYS: "manage:api-keys",
  MANAGE_WEBHOOKS: "manage:webhooks",

  // Settings
  MANAGE_SETTINGS: "manage:settings",

  // Admin
  ADMIN_PANEL: "admin:panel",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ─── Role → Permission Map ───

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  // OWNER: full access to everything
  OWNER: ALL_PERMISSIONS,

  // ADMIN: everything except billing / delete-account
  ADMIN: ALL_PERMISSIONS.filter(
    (p) => p !== PERMISSIONS.MANAGE_BILLING && p !== PERMISSIONS.DELETE_ACCOUNT
  ),

  // MANAGER: operational management without billing, admin, or account-level actions
  MANAGER: [
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.MANAGE_DOCUMENTS,
    PERMISSIONS.VIEW_DEADLINES,
    PERMISSIONS.MANAGE_DEADLINES,
    PERMISSIONS.VIEW_OWN_DEADLINES,
    PERMISSIONS.VIEW_TEAM,
    PERMISSIONS.MANAGE_PROJECTS,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.MANAGE_CLIENTS,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.UPLOAD_PHOTOS,
    PERMISSIONS.ADD_NOTES,
    PERMISSIONS.VIEW_REGULATIONS,
    PERMISSIONS.MANAGE_REGULATIONS,
  ],

  // FIELD_WORKER: limited to their own scope
  FIELD_WORKER: [
    PERMISSIONS.VIEW_OWN_DEADLINES,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_PHOTOS,
    PERMISSIONS.ADD_NOTES,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_REGULATIONS,
  ],

  // BOOKKEEPER: financial visibility + reporting
  BOOKKEEPER: [
    PERMISSIONS.VIEW_INVOICES,
    PERMISSIONS.MANAGE_INVOICES,
    PERMISSIONS.VIEW_EXPENSES,
    PERMISSIONS.MANAGE_EXPENSES,
    PERMISSIONS.EXPORT_DATA,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_CLIENTS,
    PERMISSIONS.VIEW_PROJECTS,
  ],

  // USER: backwards-compatible — same as OWNER
  USER: ALL_PERMISSIONS,
};

// ─── Public API ───

/**
 * Check whether a role has a specific permission.
 */
export function hasPermission(role: Role, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

/**
 * Throw an error if the role lacks the given permission.
 * Use in API routes for guard clauses.
 */
export function requirePermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Permission denied: role "${role}" does not have "${permission}"`
    );
  }
}

/**
 * Return all permissions for a given role.
 */
export function getPermissions(role: Role): readonly string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * API route guard — returns 403 NextResponse if the role lacks the permission, null if allowed.
 * Usage: const denied = guardPermission(user.role, PERMISSIONS.MANAGE_TEAM); if (denied) return denied;
 */
export function guardPermission(
  role: Role | undefined,
  permission: string
): NextResponse | null {
  if (!role || !hasPermission(role, permission)) {
    return NextResponse.json(
      { error: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }
  return null;
}
