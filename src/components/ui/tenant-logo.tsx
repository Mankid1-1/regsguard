import { tenantInitials } from "@/lib/tenant";
import type { TenantConfig } from "@/lib/tenant";

interface TenantLogoProps {
  tenant: TenantConfig;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { box: 24, font: 9 },
  md: { box: 32, font: 12 },
  lg: { box: 40, font: 15 },
};

export function TenantLogo({ tenant, size = "md", className }: TenantLogoProps) {
  const { box, font } = sizes[size];
  const initials = tenantInitials(tenant.name);

  if (tenant.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={tenant.logoUrl}
        alt={tenant.name}
        width={box}
        height={box}
        className={`rounded-lg object-contain ${className ?? ""}`}
        style={{ width: box, height: box }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-lg font-bold text-white shrink-0 ${className ?? ""}`}
      style={{
        width: box,
        height: box,
        backgroundColor: tenant.primaryColor,
        fontSize: font,
      }}
    >
      {initials}
    </div>
  );
}
