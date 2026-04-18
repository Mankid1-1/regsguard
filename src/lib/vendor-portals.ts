// Pre-fill data for the major contractor vendor-portal questionnaires
// (ISNetworld, Avetta, Veriforce, BROWZ, ComplyWorks). The contractor
// completes their BusinessProfile once in Regsguard and we emit the
// canonical fields each portal asks for, ready to copy/paste or upload.

import type { BusinessProfile } from "@prisma/client";

export type PortalSlug = "isnetworld" | "avetta" | "veriforce" | "browz" | "complyworks" | "json" | "csv";

export interface PortalField {
  label: string;
  value: string | number | null;
}

export interface PortalExport {
  portal: PortalSlug;
  generatedAt: string;
  fields: PortalField[];
}

function fmtDate(d: Date | null | undefined): string | null {
  if (!d) return null;
  return d.toISOString().split("T")[0];
}

function fmtCurrency(v: number | null | undefined): string | null {
  if (v == null) return null;
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function commonFields(p: BusinessProfile): Record<string, string | number | null> {
  return {
    legalBusinessName: p.businessName,
    dba: p.businessName,
    address: p.address,
    city: p.city,
    state: p.state,
    zip: p.zip,
    mainPhone: p.phone,
    mainEmail: p.email,
    contact: p.responsiblePerson,
    taxId: p.taxId,
    naicsCode: p.naicsCode,
    dunsNumber: p.dunsNumber,
    yearsInBusiness: p.yearsInBusiness,
    safetyContactName: p.safetyContactName,
    safetyContactEmail: p.safetyContactEmail,
    safetyContactPhone: p.safetyContactPhone,
    emrRating: p.emrRating,
    glPerOccurrence: fmtCurrency(p.glLimitPerOccurrence),
    glAggregate: fmtCurrency(p.glLimitAggregate),
    autoLiability: fmtCurrency(p.autoLiabilityLimit),
    umbrellaLiability: fmtCurrency(p.umbrellaLimit),
    wcCarrier: p.wcCarrier,
    wcPolicyNumber: p.wcPolicyNumber,
    wcExpirationDate: fmtDate(p.wcExpiration),
    glCarrier: p.insuranceProvider,
    glPolicyNumber: p.insurancePolicyNumber,
    glExpirationDate: fmtDate(p.insuranceExpiration),
    bondCarrier: p.bondProvider,
    bondAmount: p.bondAmount,
    bondExpirationDate: fmtDate(p.bondExpiration),
  };
}

const PORTAL_FIELD_ORDER: Record<Exclude<PortalSlug, "json" | "csv">, string[]> = {
  isnetworld: [
    "legalBusinessName", "dba", "taxId", "naicsCode", "dunsNumber", "address", "city", "state", "zip",
    "mainPhone", "mainEmail", "contact", "yearsInBusiness", "emrRating",
    "wcCarrier", "wcPolicyNumber", "wcExpirationDate",
    "glCarrier", "glPolicyNumber", "glExpirationDate", "glPerOccurrence", "glAggregate",
    "autoLiability", "umbrellaLiability",
    "safetyContactName", "safetyContactEmail", "safetyContactPhone",
  ],
  avetta: [
    "legalBusinessName", "dba", "taxId", "address", "city", "state", "zip", "mainPhone", "mainEmail",
    "contact", "naicsCode", "yearsInBusiness", "emrRating",
    "wcCarrier", "wcPolicyNumber", "wcExpirationDate",
    "glCarrier", "glPolicyNumber", "glExpirationDate", "glPerOccurrence", "glAggregate",
    "autoLiability", "umbrellaLiability",
    "safetyContactName", "safetyContactEmail",
  ],
  veriforce: [
    "legalBusinessName", "taxId", "naicsCode", "address", "city", "state", "zip",
    "mainPhone", "mainEmail", "contact", "yearsInBusiness", "emrRating",
    "wcCarrier", "wcPolicyNumber", "wcExpirationDate",
    "glCarrier", "glPolicyNumber", "glExpirationDate", "glPerOccurrence", "glAggregate",
    "safetyContactName", "safetyContactEmail", "safetyContactPhone",
  ],
  browz: [
    "legalBusinessName", "dba", "taxId", "dunsNumber", "address", "city", "state", "zip",
    "mainPhone", "mainEmail", "contact", "yearsInBusiness", "emrRating",
    "glCarrier", "glPolicyNumber", "glExpirationDate", "glPerOccurrence",
    "wcCarrier", "wcPolicyNumber", "wcExpirationDate",
  ],
  complyworks: [
    "legalBusinessName", "taxId", "address", "city", "state", "zip", "mainPhone", "mainEmail",
    "contact", "naicsCode", "yearsInBusiness", "emrRating",
    "wcCarrier", "wcPolicyNumber", "wcExpirationDate",
    "glCarrier", "glPolicyNumber", "glExpirationDate",
    "safetyContactName", "safetyContactEmail",
  ],
};

const FIELD_LABELS: Record<string, string> = {
  legalBusinessName: "Legal Business Name",
  dba: "DBA / Trade Name",
  taxId: "Federal Tax ID (EIN)",
  naicsCode: "NAICS Code",
  dunsNumber: "DUNS Number",
  address: "Address",
  city: "City",
  state: "State",
  zip: "ZIP",
  mainPhone: "Main Phone",
  mainEmail: "Main Email",
  contact: "Primary Contact Name",
  yearsInBusiness: "Years In Business",
  emrRating: "EMR (current)",
  wcCarrier: "Workers Comp Carrier",
  wcPolicyNumber: "WC Policy #",
  wcExpirationDate: "WC Expiration",
  glCarrier: "General Liability Carrier",
  glPolicyNumber: "GL Policy #",
  glExpirationDate: "GL Expiration",
  glPerOccurrence: "GL Per-Occurrence Limit",
  glAggregate: "GL Aggregate Limit",
  autoLiability: "Auto Liability Limit",
  umbrellaLiability: "Umbrella Liability Limit",
  bondCarrier: "Surety Bond Carrier",
  bondAmount: "Bond Amount",
  bondExpirationDate: "Bond Expiration",
  safetyContactName: "Safety Contact Name",
  safetyContactEmail: "Safety Contact Email",
  safetyContactPhone: "Safety Contact Phone",
};

export function exportForPortal(profile: BusinessProfile, portal: PortalSlug): PortalExport {
  const all = commonFields(profile);
  const generatedAt = new Date().toISOString();

  if (portal === "json") {
    return {
      portal,
      generatedAt,
      fields: Object.entries(all).map(([k, v]) => ({ label: k, value: v ?? null })),
    };
  }

  if (portal === "csv") {
    return {
      portal,
      generatedAt,
      fields: Object.entries(all).map(([k, v]) => ({ label: FIELD_LABELS[k] ?? k, value: v ?? null })),
    };
  }

  const order = PORTAL_FIELD_ORDER[portal];
  return {
    portal,
    generatedAt,
    fields: order.map((key) => ({
      label: FIELD_LABELS[key] ?? key,
      value: all[key] ?? null,
    })),
  };
}

export function toCsv(exportData: PortalExport): string {
  const header = "Field,Value";
  const rows = exportData.fields.map((f) => {
    const v = f.value == null ? "" : String(f.value).replace(/"/g, '""');
    const label = f.label.replace(/"/g, '""');
    return `"${label}","${v}"`;
  });
  return [header, ...rows].join("\n");
}
