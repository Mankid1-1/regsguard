import { describe, it, expect } from "vitest";
import { hasPermission, guardPermission, getPermissions, PERMISSIONS } from "./rbac";

// We need to use string literals matching the Prisma Role enum values
// since we can't import from @prisma/client in tests without a generated client.
type Role = "OWNER" | "ADMIN" | "MANAGER" | "FIELD_WORKER" | "BOOKKEEPER" | "USER";

describe("hasPermission", () => {
  it("OWNER has all permissions", () => {
    const allPerms = Object.values(PERMISSIONS);
    for (const perm of allPerms) {
      expect(hasPermission("OWNER" as Role, perm)).toBe(true);
    }
  });

  it("USER has all permissions (backwards-compatible with OWNER)", () => {
    const allPerms = Object.values(PERMISSIONS);
    for (const perm of allPerms) {
      expect(hasPermission("USER" as Role, perm)).toBe(true);
    }
  });

  it("ADMIN has all permissions except MANAGE_BILLING and DELETE_ACCOUNT", () => {
    expect(hasPermission("ADMIN" as Role, PERMISSIONS.MANAGE_TEAM)).toBe(true);
    expect(hasPermission("ADMIN" as Role, PERMISSIONS.MANAGE_DOCUMENTS)).toBe(true);
    expect(hasPermission("ADMIN" as Role, PERMISSIONS.MANAGE_BILLING)).toBe(false);
    expect(hasPermission("ADMIN" as Role, PERMISSIONS.DELETE_ACCOUNT)).toBe(false);
  });

  it("FIELD_WORKER has limited permissions", () => {
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.VIEW_OWN_DEADLINES)).toBe(true);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.VIEW_DOCUMENTS)).toBe(true);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.UPLOAD_PHOTOS)).toBe(true);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.ADD_NOTES)).toBe(true);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.VIEW_PROJECTS)).toBe(true);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.VIEW_REGULATIONS)).toBe(true);

    // Should NOT have these
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.MANAGE_TEAM)).toBe(false);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.MANAGE_BILLING)).toBe(false);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.MANAGE_DOCUMENTS)).toBe(false);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.VIEW_INVOICES)).toBe(false);
    expect(hasPermission("FIELD_WORKER" as Role, PERMISSIONS.EXPORT_DATA)).toBe(false);
  });

  it("BOOKKEEPER can view invoices but not manage team", () => {
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.VIEW_INVOICES)).toBe(true);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_INVOICES)).toBe(true);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.VIEW_EXPENSES)).toBe(true);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_EXPENSES)).toBe(true);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.EXPORT_DATA)).toBe(true);

    // Should NOT have these
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_TEAM)).toBe(false);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_BILLING)).toBe(false);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_DOCUMENTS)).toBe(false);
    expect(hasPermission("BOOKKEEPER" as Role, PERMISSIONS.MANAGE_DEADLINES)).toBe(false);
  });

  it("MANAGER has operational permissions without billing or admin", () => {
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_DOCUMENTS)).toBe(true);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_DEADLINES)).toBe(true);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_PROJECTS)).toBe(true);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_CLIENTS)).toBe(true);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.EXPORT_DATA)).toBe(true);

    // Should NOT have these
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_BILLING)).toBe(false);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.DELETE_ACCOUNT)).toBe(false);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.MANAGE_TEAM)).toBe(false);
    expect(hasPermission("MANAGER" as Role, PERMISSIONS.ADMIN_PANEL)).toBe(false);
  });
});

describe("getPermissions", () => {
  it("returns all permissions for OWNER", () => {
    const perms = getPermissions("OWNER" as Role);
    expect(perms.length).toBe(Object.values(PERMISSIONS).length);
  });

  it("returns fewer permissions for FIELD_WORKER than OWNER", () => {
    const ownerPerms = getPermissions("OWNER" as Role);
    const fieldWorkerPerms = getPermissions("FIELD_WORKER" as Role);
    expect(fieldWorkerPerms.length).toBeLessThan(ownerPerms.length);
  });
});

describe("guardPermission", () => {
  it("returns null when role has the permission", () => {
    const result = guardPermission("OWNER" as Role, PERMISSIONS.MANAGE_TEAM);
    expect(result).toBeNull();
  });

  it("returns 403 response when role lacks the permission", () => {
    const result = guardPermission("FIELD_WORKER" as Role, PERMISSIONS.MANAGE_TEAM);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });

  it("returns 403 response when role is undefined", () => {
    const result = guardPermission(undefined, PERMISSIONS.MANAGE_TEAM);
    expect(result).not.toBeNull();
    expect(result!.status).toBe(403);
  });
});
