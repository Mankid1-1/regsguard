"use client";

import { createContext, useContext } from "react";
import type { TenantConfig } from "@/lib/tenant";
import { DEFAULT_TENANT } from "@/lib/tenant";

const TenantContext = createContext<TenantConfig>(DEFAULT_TENANT);

export function TenantProvider({
  config,
  children,
}: {
  config: TenantConfig;
  children: React.ReactNode;
}) {
  return (
    <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
  );
}

export function useTenant(): TenantConfig {
  return useContext(TenantContext);
}
