import { z } from "zod";
import { sanitize } from "@/lib/sanitize";

export const businessProfileSchema = z.object({
  businessName: z.string().min(1, "Business name is required").transform(sanitize),
  address: z.string().min(1, "Address is required").transform(sanitize),
  city: z.string().min(1, "City is required").transform(sanitize),
  state: z.string().min(2, "State is required").max(2, "Use 2-letter state code"),
  zip: z
    .string()
    .min(5, "ZIP code is required")
    .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
  phone: z
    .string()
    .min(10, "Phone number is required")
    .regex(/^[\d\s\-().+]+$/, "Invalid phone number format"),
  email: z.string().email("Invalid email address"),
  responsiblePerson: z.string().min(1, "Responsible person is required").transform(sanitize),
  licenseNumbers: z.record(z.string(), z.string()).optional().default({}),
  insuranceProvider: z.string().optional().default(""),
  insurancePolicyNumber: z.string().optional().default(""),
  insuranceExpiration: z.string().optional().default(""),
  bondAmount: z.string().optional().default(""),
  bondProvider: z.string().optional().default(""),
  bondExpiration: z.string().optional().default(""),

  // Branding for generated PDFs
  logoUrl: z.string().optional().default(""),
  brandPrimaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use hex like #1e40af").optional().or(z.literal("")).default(""),
  brandSecondaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use hex like #1e40af").optional().or(z.literal("")).default(""),
  brandFooter: z.string().max(500).optional().default(""),
});

export type BusinessProfileInput = z.infer<typeof businessProfileSchema>;
