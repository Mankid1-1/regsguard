export interface TenantConfig {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  supportEmail: string | null;
  fromEmail: string | null;
  fromName: string | null;
}

export const DEFAULT_TENANT: TenantConfig = {
  id: "default",
  name: process.env.APP_NAME || "RegsGuard",
  slug: "default",
  logoUrl: null,
  primaryColor: "#1e40af",
  supportEmail: null,
  fromEmail: null,
  fromName: null,
};

export function slugFromHostname(hostname: string): string {
  const host = hostname.split(":")[0].toLowerCase();
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN;
  if (baseDomain) {
    const suffix = `.${baseDomain}`;
    if (host.endsWith(suffix)) {
      const sub = host.slice(0, -suffix.length);
      if (sub && sub !== "www") return sub;
    }
  }
  return "default";
}

export function tenantInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
