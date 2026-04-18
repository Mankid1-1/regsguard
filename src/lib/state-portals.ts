// State licensing-board portal data for MN + WI.
// Used to deep-link contractors directly to their renewal forms,
// CE reporting, license lookup, and exam scheduling.
//
// URLs verified 2026-04-17. Update if state board re-platforms.

export type StateCode = "MN" | "WI";
export type Trade = "PLUMBING" | "ELECTRICAL" | "HVAC" | "GENERAL" | "EPA" | "LEAD_SAFE";
export type PortalActionType = "RENEW" | "LOOKUP" | "CE_REPORT" | "EXAM" | "FORMS" | "CONTACT";

export interface PortalAction {
  type: PortalActionType;
  label: string;
  url: string;
  notes?: string;
}

export interface StatePortal {
  state: StateCode;
  trade: Trade;
  authority: string;
  actions: PortalAction[];
}

export const STATE_PORTALS: StatePortal[] = [
  // ─── MINNESOTA ───
  {
    state: "MN",
    trade: "PLUMBING",
    authority: "MN Department of Labor and Industry (DLI)",
    actions: [
      { type: "RENEW", label: "Renew plumbing license", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/plumbing-licensing-and-registration" },
      { type: "LOOKUP", label: "Look up MN plumbing license", url: "https://secure.doli.state.mn.us/lookup/Licensing.aspx" },
      { type: "CE_REPORT", label: "Plumbing CE requirements", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/continuing-education-licensees" },
      { type: "EXAM", label: "Schedule plumbing exam (PSI)", url: "https://candidate.psiexams.com" },
      { type: "FORMS", label: "Plumbing forms", url: "https://www.dli.mn.gov/forms-search?keys=plumbing" },
      { type: "CONTACT", label: "Email DLI Plumbing", url: "mailto:dli.plumbing@state.mn.us", notes: "(651) 284-5067" },
    ],
  },
  {
    state: "MN",
    trade: "ELECTRICAL",
    authority: "MN Department of Labor and Industry (DLI)",
    actions: [
      { type: "RENEW", label: "Renew electrical license", url: "https://www.dli.mn.gov/business/electrical-licensing" },
      { type: "LOOKUP", label: "Look up MN electrical license", url: "https://secure.doli.state.mn.us/lookup/Licensing.aspx" },
      { type: "CE_REPORT", label: "Electrical CE requirements", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/continuing-education-licensees" },
      { type: "EXAM", label: "Schedule electrical exam (PSI)", url: "https://candidate.psiexams.com" },
      { type: "FORMS", label: "Electrical forms", url: "https://www.dli.mn.gov/forms-search?keys=electrical" },
      { type: "CONTACT", label: "Email DLI Electrical", url: "mailto:electricity.dli@state.mn.us", notes: "(651) 284-5026" },
    ],
  },
  {
    state: "MN",
    trade: "HVAC",
    authority: "MN Department of Labor and Industry (DLI)",
    actions: [
      { type: "RENEW", label: "Renew HVAC license", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/high-pressure-piping-licensing-and-registration" },
      { type: "LOOKUP", label: "Look up MN HVAC license", url: "https://secure.doli.state.mn.us/lookup/Licensing.aspx" },
      { type: "FORMS", label: "HVAC forms", url: "https://www.dli.mn.gov/forms-search?keys=hvac" },
    ],
  },
  {
    state: "MN",
    trade: "GENERAL",
    authority: "MN Department of Labor and Industry (DLI)",
    actions: [
      { type: "RENEW", label: "Renew residential building contractor license", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/residential-building-contractor-and-remodeler-licensing" },
      { type: "LOOKUP", label: "MN contractor license lookup", url: "https://secure.doli.state.mn.us/lookup/Licensing.aspx" },
      { type: "CE_REPORT", label: "Builder CE requirements", url: "https://www.dli.mn.gov/business/get-licenses-and-permits/continuing-education-licensees" },
      { type: "FORMS", label: "Contractor forms", url: "https://www.dli.mn.gov/forms-search?keys=contractor" },
      { type: "CONTACT", label: "Email DLI Construction Codes", url: "mailto:dli.contractor@state.mn.us" },
    ],
  },
  {
    state: "MN",
    trade: "EPA",
    authority: "EPA / MN Pollution Control Agency",
    actions: [
      { type: "RENEW", label: "EPA 608 renewal info", url: "https://www.epa.gov/section608" },
      { type: "EXAM", label: "EPA 608 exam (ESCO)", url: "https://www.escoinst.com/" },
    ],
  },
  {
    state: "MN",
    trade: "LEAD_SAFE",
    authority: "MN Department of Health (MDH)",
    actions: [
      { type: "RENEW", label: "MN lead-safe renewal", url: "https://www.health.state.mn.us/communities/environment/lead/" },
      { type: "FORMS", label: "Lead program forms", url: "https://www.health.state.mn.us/communities/environment/lead/business/index.html" },
    ],
  },

  // ─── WISCONSIN ───
  {
    state: "WI",
    trade: "PLUMBING",
    authority: "WI Department of Safety and Professional Services (DSPS)",
    actions: [
      { type: "RENEW", label: "Renew WI plumbing credential", url: "https://dsps.wi.gov/Pages/SelfService/Default.aspx" },
      { type: "LOOKUP", label: "WI license lookup", url: "https://dsps.wi.gov/Pages/SelfService/LicenseLookUp.aspx" },
      { type: "CE_REPORT", label: "WI plumbing CE info", url: "https://dsps.wi.gov/Pages/Professions/JourneymanPlumber/Default.aspx" },
      { type: "EXAM", label: "Schedule plumbing exam", url: "https://dsps.wi.gov/Pages/SelfService/ExamScheduling.aspx" },
      { type: "FORMS", label: "Plumbing forms", url: "https://dsps.wi.gov/pages/Professions/JourneymanPlumber/Forms.aspx" },
    ],
  },
  {
    state: "WI",
    trade: "ELECTRICAL",
    authority: "WI Department of Safety and Professional Services (DSPS)",
    actions: [
      { type: "RENEW", label: "Renew WI electrical credential", url: "https://dsps.wi.gov/Pages/SelfService/Default.aspx" },
      { type: "LOOKUP", label: "WI license lookup", url: "https://dsps.wi.gov/Pages/SelfService/LicenseLookUp.aspx" },
      { type: "CE_REPORT", label: "WI electrical CE info", url: "https://dsps.wi.gov/Pages/Professions/Electrician/Default.aspx" },
      { type: "EXAM", label: "Schedule electrical exam", url: "https://dsps.wi.gov/Pages/SelfService/ExamScheduling.aspx" },
      { type: "FORMS", label: "Electrical forms", url: "https://dsps.wi.gov/pages/Professions/Electrician/Forms.aspx" },
    ],
  },
  {
    state: "WI",
    trade: "HVAC",
    authority: "WI Department of Safety and Professional Services (DSPS)",
    actions: [
      { type: "RENEW", label: "Renew WI HVAC credential", url: "https://dsps.wi.gov/Pages/SelfService/Default.aspx" },
      { type: "LOOKUP", label: "WI license lookup", url: "https://dsps.wi.gov/Pages/SelfService/LicenseLookUp.aspx" },
      { type: "FORMS", label: "HVAC forms", url: "https://dsps.wi.gov/Pages/Professions/HVAC.aspx" },
    ],
  },
  {
    state: "WI",
    trade: "GENERAL",
    authority: "WI Department of Safety and Professional Services (DSPS)",
    actions: [
      { type: "RENEW", label: "Renew Dwelling Contractor credential", url: "https://dsps.wi.gov/Pages/SelfService/Default.aspx" },
      { type: "LOOKUP", label: "WI license lookup", url: "https://dsps.wi.gov/Pages/SelfService/LicenseLookUp.aspx" },
      { type: "CE_REPORT", label: "Dwelling Contractor CE info", url: "https://dsps.wi.gov/Pages/Professions/DwellingContractor/Default.aspx" },
      { type: "FORMS", label: "Dwelling Contractor forms", url: "https://dsps.wi.gov/Pages/Professions/DwellingContractor/Forms.aspx" },
    ],
  },
  {
    state: "WI",
    trade: "EPA",
    authority: "EPA / WI DNR",
    actions: [
      { type: "RENEW", label: "EPA 608 renewal info", url: "https://www.epa.gov/section608" },
    ],
  },
  {
    state: "WI",
    trade: "LEAD_SAFE",
    authority: "WI Department of Health Services",
    actions: [
      { type: "RENEW", label: "WI lead-safe certification", url: "https://www.dhs.wisconsin.gov/lead/index.htm" },
    ],
  },
];

export function getPortalActions(state: StateCode, trade: Trade): PortalAction[] {
  const portal = STATE_PORTALS.find((p) => p.state === state && p.trade === trade);
  return portal?.actions ?? [];
}

export function getRenewalUrl(state: StateCode, trade: Trade): string | null {
  const actions = getPortalActions(state, trade);
  return actions.find((a) => a.type === "RENEW")?.url ?? null;
}
