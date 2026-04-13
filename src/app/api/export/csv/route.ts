import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";

const BATCH_SIZE = 500;

/**
 * GET /api/export/csv?type=deadlines|compliance-log|ce-credits|expenses
 *
 * Exports user data as a streaming CSV file download.
 * Uses cursor-based batching to avoid loading entire datasets into memory.
 */
export async function GET(req: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.EXPORT_DATA);
  if (denied) return denied;

  const userId = user.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  if (!type || !["deadlines", "compliance-log", "ce-credits", "expenses"].includes(type)) {
    return NextResponse.json(
      { error: "Invalid type. Must be one of: deadlines, compliance-log, ce-credits, expenses" },
      { status: 400 }
    );
  }

  const filenames: Record<string, string> = {
    deadlines: "regsguard-deadlines.csv",
    "compliance-log": "regsguard-compliance-log.csv",
    "ce-credits": "regsguard-ce-credits.csv",
    expenses: "regsguard-expenses.csv",
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        switch (type) {
          case "deadlines":
            await streamDeadlines(userId, controller, encoder);
            break;
          case "compliance-log":
            await streamComplianceLog(userId, controller, encoder);
            break;
          case "ce-credits":
            await streamCECredits(userId, controller, encoder);
            break;
          case "expenses":
            await streamExpenses(userId, controller, encoder);
            break;
        }
        controller.close();
      } catch {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filenames[type]}"`,
    },
  });
}

// ── Streaming Export Functions ──

async function streamDeadlines(
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  controller.enqueue(
    encoder.encode("Regulation,Authority,Trade,State,Category,Renewal Cycle,Due Date,Status,Completed At,Fee\n")
  );

  let cursor: string | undefined;
  while (true) {
    const batch = await prisma.userDeadline.findMany({
      where: { userId },
      include: {
        regulation: {
          select: { title: true, authority: true, trade: true, state: true, renewalCycle: true, category: true, fee: true },
        },
      },
      orderBy: { nextDueDate: "asc" },
      take: BATCH_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const items = batch.slice(0, BATCH_SIZE);
    for (const d of items) {
      const row = [
        csvEscape(d.regulation.title), csvEscape(d.regulation.authority),
        d.regulation.trade, d.regulation.state,
        formatCategory(d.regulation.category), d.regulation.renewalCycle,
        formatDate(d.nextDueDate), d.status,
        d.completedAt ? formatDate(d.completedAt) : "",
        d.regulation.fee || "",
      ].join(",");
      controller.enqueue(encoder.encode(row + "\n"));
    }

    if (batch.length <= BATCH_SIZE) break;
    cursor = items[items.length - 1].id;
  }
}

async function streamComplianceLog(
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  controller.enqueue(encoder.encode("Date,Action,Regulation,Details\n"));

  let cursor: string | undefined;
  while (true) {
    const batch = await prisma.complianceLog.findMany({
      where: { userId },
      include: { regulation: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: BATCH_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const items = batch.slice(0, BATCH_SIZE);
    for (const log of items) {
      const row = [
        formatDateTime(log.createdAt), formatAction(log.action),
        log.regulation?.title ? csvEscape(log.regulation.title) : "",
        log.details ? csvEscape(JSON.stringify(log.details)) : "",
      ].join(",");
      controller.enqueue(encoder.encode(row + "\n"));
    }

    if (batch.length <= BATCH_SIZE) break;
    cursor = items[items.length - 1].id;
  }
}

async function streamCECredits(
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  controller.enqueue(encoder.encode("Course Name,Provider,Hours,Completed Date,Expires,Related Regulation,Notes\n"));

  let cursor: string | undefined;
  while (true) {
    const batch = await prisma.cECredit.findMany({
      where: { userId },
      include: { regulation: { select: { title: true } } },
      orderBy: { completedAt: "desc" },
      take: BATCH_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const items = batch.slice(0, BATCH_SIZE);
    for (const c of items) {
      const row = [
        csvEscape(c.courseName), csvEscape(c.provider || ""),
        String(c.hours), formatDate(c.completedAt),
        c.expiresAt ? formatDate(c.expiresAt) : "",
        c.regulation?.title ? csvEscape(c.regulation.title) : "",
        csvEscape(c.notes || ""),
      ].join(",");
      controller.enqueue(encoder.encode(row + "\n"));
    }

    if (batch.length <= BATCH_SIZE) break;
    cursor = items[items.length - 1].id;
  }
}

async function streamExpenses(
  userId: string,
  controller: ReadableStreamDefaultController,
  encoder: TextEncoder
) {
  controller.enqueue(encoder.encode("Date,Category,Amount,Description,Vendor,Project\n"));

  let cursor: string | undefined;
  while (true) {
    const batch = await prisma.expense.findMany({
      where: { userId },
      include: { project: { select: { name: true } } },
      orderBy: { date: "desc" },
      take: BATCH_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    });

    const items = batch.slice(0, BATCH_SIZE);
    for (const e of items) {
      const row = [
        formatDate(e.date), formatCategory(e.category),
        e.amount.toFixed(2), csvEscape(e.description || ""),
        csvEscape(e.vendor || ""),
        e.project?.name ? csvEscape(e.project.name) : "",
      ].join(",");
      controller.enqueue(encoder.encode(row + "\n"));
    }

    if (batch.length <= BATCH_SIZE) break;
    cursor = items[items.length - 1].id;
  }
}

// ── Helpers ──

function csvEscape(value: string): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
}

function formatAction(action: string): string {
  return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatCategory(category: string): string {
  return category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
