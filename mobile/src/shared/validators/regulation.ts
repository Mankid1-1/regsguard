import { z } from "zod";

export const regulationSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  authority: z.string().min(1, "Authority is required"),
  state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
  trade: z.enum([
    "PLUMBING",
    "ELECTRICAL",
    "HVAC",
    "GENERAL",
    "EPA",
    "LEAD_SAFE",
  ]),
  renewalCycle: z.enum([
    "ANNUAL",
    "BIENNIAL",
    "TRIENNIAL",
    "FIVE_YEAR",
    "ONE_TIME",
    "VARIES",
  ]),
  category: z.enum([
    "LICENSE_RENEWAL",
    "CONTINUING_EDUCATION",
    "INSURANCE",
    "BONDING",
    "EPA_CERTIFICATION",
    "SAFETY_TRAINING",
    "PERMIT",
    "REGISTRATION",
  ]),
  officialEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  portalUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  fee: z.string().optional().default(""),
  defaultDueMonth: z.number().int().min(1).max(12).optional(),
  defaultDueDay: z.number().int().min(1).max(31).optional(),
  notes: z.string().optional().default(""),
});

export type RegulationInput = z.infer<typeof regulationSchema>;
