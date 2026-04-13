import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { rateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import type { Role } from "@prisma/client";

/**
 * POST /api/import/regulations
 *
 * Bulk import regulations from CSV.
 *
 * Expected CSV format (header row required):
 *   trade,state,title,description,authority,renewalCycle,category,fee,officialEmail,portalUrl,defaultDueMonth,defaultDueDay,notes
 *
 * Valid enum values:
 *   trade: PLUMBING, ELECTRICAL, HVAC, GENERAL, EPA, LEAD_SAFE
 *   renewalCycle: ANNUAL, BIENNIAL, TRIENNIAL, FIVE_YEAR, ONE_TIME, VARIES
 *   category: LICENSE_RENEWAL, CONTINUING_EDUCATION, INSURANCE, BONDING, EPA_CERTIFICATION, SAFETY_TRAINING, PERMIT, REGISTRATION
 */
export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit
  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  // RBAC: only ADMIN/OWNER can import
  const denied = guardPermission(user.role as Role, PERMISSIONS.ADMIN_PANEL);
  if (denied) return denied;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim());

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV must have a header row and at least one data row" }, { status: 400 });
    }

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const requiredHeaders = ["trade", "state", "title", "description", "authority", "renewalcycle", "category"];

    for (const required of requiredHeaders) {
      if (!headers.includes(required)) {
        return NextResponse.json(
          { error: `Missing required CSV column: ${required}` },
          { status: 400 }
        );
      }
    }

    const VALID_TRADES = ["PLUMBING", "ELECTRICAL", "HVAC", "GENERAL", "EPA", "LEAD_SAFE"];
    const VALID_CYCLES = ["ANNUAL", "BIENNIAL", "TRIENNIAL", "FIVE_YEAR", "ONE_TIME", "VARIES"];
    const VALID_CATEGORIES = [
      "LICENSE_RENEWAL", "CONTINUING_EDUCATION", "INSURANCE", "BONDING",
      "EPA_CERTIFICATION", "SAFETY_TRAINING", "PERMIT", "REGISTRATION",
    ];

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    // Parse and upsert each row
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: not enough columns`);
        skipped++;
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx]?.trim() || "";
      });

      // Validate enums
      const trade = row.trade?.toUpperCase();
      const renewalCycle = row.renewalcycle?.toUpperCase();
      const category = row.category?.toUpperCase();
      const state = row.state?.toUpperCase();

      if (!VALID_TRADES.includes(trade)) {
        errors.push(`Row ${i + 1}: invalid trade "${row.trade}"`);
        skipped++;
        continue;
      }

      if (!VALID_CYCLES.includes(renewalCycle)) {
        errors.push(`Row ${i + 1}: invalid renewalCycle "${row.renewalcycle}"`);
        skipped++;
        continue;
      }

      if (!VALID_CATEGORIES.includes(category)) {
        errors.push(`Row ${i + 1}: invalid category "${row.category}"`);
        skipped++;
        continue;
      }

      if (!state || state.length !== 2) {
        errors.push(`Row ${i + 1}: state must be a 2-letter code`);
        skipped++;
        continue;
      }

      if (!row.title || !row.description || !row.authority) {
        errors.push(`Row ${i + 1}: title, description, and authority are required`);
        skipped++;
        continue;
      }

      try {
        await prisma.regulation.upsert({
          where: {
            trade_state_title: {
              trade: trade as "PLUMBING" | "ELECTRICAL" | "HVAC" | "GENERAL" | "EPA" | "LEAD_SAFE",
              state,
              title: row.title,
            },
          },
          update: {
            description: row.description,
            authority: row.authority,
            renewalCycle: renewalCycle as "ANNUAL" | "BIENNIAL" | "TRIENNIAL" | "FIVE_YEAR" | "ONE_TIME" | "VARIES",
            category: category as "LICENSE_RENEWAL" | "CONTINUING_EDUCATION" | "INSURANCE" | "BONDING" | "EPA_CERTIFICATION" | "SAFETY_TRAINING" | "PERMIT" | "REGISTRATION",
            fee: row.fee || null,
            officialEmail: row.officialemail || null,
            portalUrl: row.portalurl || null,
            defaultDueMonth: row.defaultduemonth ? parseInt(row.defaultduemonth) : null,
            defaultDueDay: row.defaultdueday ? parseInt(row.defaultdueday) : null,
            notes: row.notes || null,
          },
          create: {
            trade: trade as "PLUMBING" | "ELECTRICAL" | "HVAC" | "GENERAL" | "EPA" | "LEAD_SAFE",
            state,
            title: row.title,
            description: row.description,
            authority: row.authority,
            renewalCycle: renewalCycle as "ANNUAL" | "BIENNIAL" | "TRIENNIAL" | "FIVE_YEAR" | "ONE_TIME" | "VARIES",
            category: category as "LICENSE_RENEWAL" | "CONTINUING_EDUCATION" | "INSURANCE" | "BONDING" | "EPA_CERTIFICATION" | "SAFETY_TRAINING" | "PERMIT" | "REGISTRATION",
            fee: row.fee || null,
            officialEmail: row.officialemail || null,
            portalUrl: row.portalurl || null,
            defaultDueMonth: row.defaultduemonth ? parseInt(row.defaultduemonth) : null,
            defaultDueDay: row.defaultdueday ? parseInt(row.defaultdueday) : null,
            notes: row.notes || null,
          },
        });
        imported++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 1}: ${msg}`);
        skipped++;
      }
    }

    logger.info("CSV import completed", { imported, skipped, errors: errors.length });

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: lines.length - 1,
      errors: errors.slice(0, 20), // Cap error list
    });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error("CSV import failed", {}, error);
    return NextResponse.json({ error: "Import failed: " + error.message }, { status: 500 });
  }
}

/**
 * Simple CSV line parser that handles quoted fields with commas.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }

  result.push(current);
  return result;
}
