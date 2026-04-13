/**
 * Server-only tenant resolution functions.
 *
 * Separated from tenant.ts to prevent ioredis (via cache → redis)
 * from being bundled into client components.
 */

import { cache } from "react";
import { prisma } from "./prisma";
import { cache as appCache } from "./cache";
import { DEFAULT_TENANT, type TenantConfig } from "./tenant";

export const getTenantBySlugOrDomain = cache(
  async (key: string): Promise<TenantConfig> => {
    if (key === "default") return DEFAULT_TENANT;

    return appCache.get(`tenant:${key}`, 300, async () => {
      try {
        const tenant = await prisma.tenant.findFirst({
          where: {
            OR: [{ slug: key }, { domain: key }],
            active: true,
          },
        });
        if (!tenant) return DEFAULT_TENANT;
        return {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          logoUrl: tenant.logoUrl,
          primaryColor: tenant.primaryColor,
          supportEmail: tenant.supportEmail,
          fromEmail: tenant.fromEmail,
          fromName: tenant.fromName,
        };
      } catch {
        return DEFAULT_TENANT;
      }
    });
  }
);

export async function getTenantFromHeaders(): Promise<TenantConfig> {
  const { headers } = await import("next/headers");
  const h = await headers();
  const slug = h.get("x-tenant-slug") || "default";
  return getTenantBySlugOrDomain(slug);
}
