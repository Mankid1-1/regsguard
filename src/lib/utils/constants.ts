export const TRADES = [
  { value: "PLUMBING", label: "Plumbing" },
  { value: "ELECTRICAL", label: "Electrical" },
  { value: "HVAC", label: "HVAC / Mechanical" },
  { value: "GENERAL", label: "General Contractor" },
  { value: "EPA", label: "EPA Certifications" },
  { value: "LEAD_SAFE", label: "Lead-Safe / RRP" },
] as const;

export const STATES = [
  { value: "MN", label: "Minnesota" },
  { value: "WI", label: "Wisconsin" },
] as const;

export const ALERT_THRESHOLDS = [60, 30, 14, 7, 1] as const;

export type TradeValue = (typeof TRADES)[number]["value"];
export type StateValue = (typeof STATES)[number]["value"];
