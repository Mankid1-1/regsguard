import type { Role } from "./types";

export const PERMISSIONS = {
  MANAGE_TEAM: "manage:team",
  VIEW_TEAM: "view:team",
  MANAGE_BILLING: "manage:billing",
  DELETE_ACCOUNT: "delete:account",
  MANAGE_DOCUMENTS: "manage:documents",
  VIEW_DOCUMENTS: "view:documents",
  MANAGE_DEADLINES: "manage:deadlines",
  VIEW_DEADLINES: "view:deadlines",
  VIEW_OWN_DEADLINES: "view:own-deadlines",
  MANAGE_PROJECTS: "manage:projects",
  VIEW_PROJECTS: "view:projects",
  EXPORT_DATA: "export:data",
  EXPORT_REPORTS: "export:reports",
  UPLOAD_PHOTOS: "upload:photos",
  ADD_NOTES: "add:notes",
  VIEW_INVOICES: "view:invoices",
  MANAGE_INVOICES: "manage:invoices",
  VIEW_EXPENSES: "view:expenses",
  MANAGE_EXPENSES: "manage:expenses",
  MANAGE_REGULATIONS: "manage:regulations",
  VIEW_REGULATIONS: "view:regulations",
  MANAGE_CLIENTS: "manage:clients",
  VIEW_CLIENTS: "view:clients",
  MANAGE_API_KEYS: "manage:api-keys",
  MANAGE_WEBHOOKS: "manage:webhooks",
  MANAGE_SETTINGS: "manage:settings",
  ADMIN_PANEL: "admin:panel",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

const ROLE_PERMISSIONS: Record<Role, readonly string[]> = {
  OWNER: ALL_PERMISSIONS,
  ADMIN: ALL_PERMISSIONS.filter(
    (p) => p !== PERMISSIONS.MANAGE_BILLING && p !== PERMISSIONS.DELETE_ACCOUNT
  ),
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
  FIELD_WORKER: [
    PERMISSIONS.VIEW_OWN_DEADLINES,
    PERMISSIONS.VIEW_DOCUMENTS,
    PERMISSIONS.UPLOAD_PHOTOS,
    PERMISSIONS.ADD_NOTES,
    PERMISSIONS.VIEW_PROJECTS,
    PERMISSIONS.VIEW_REGULATIONS,
  ],
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
  USER: ALL_PERMISSIONS,
};

export function hasPermission(role: Role, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role];
  if (!allowed) return false;
  return allowed.includes(permission);
}

export function requirePermission(role: Role, permission: string): void {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Permission denied: role "${role}" does not have "${permission}"`
    );
  }
}

export function getPermissions(role: Role): readonly string[] {
  return ROLE_PERMISSIONS[role] ?? [];
}
