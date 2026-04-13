import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { z } from "zod";

interface NoteEntry {
  text: string;
  source: "voice" | "text";
  createdAt: string;
}

const noteSchema = z.object({
  note: z.string().min(1, "Note cannot be empty"),
  source: z.enum(["voice", "text"]).default("text"),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true, name: true, description: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Notes are stored as a JSON array in the description field,
  // prefixed with a sentinel. If the description doesn't contain notes JSON,
  // treat it as a legacy plain-text description with no structured notes.
  const notes = parseNotes(project.description);

  return NextResponse.json({ projectId: project.id, notes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.ADD_NOTES);
  if (denied) return denied;

  const { id } = await params;

  const body = await request.json();
  const parsed = noteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true, description: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Build new note entry
  const newNote: NoteEntry = {
    text: parsed.data.note,
    source: parsed.data.source,
    createdAt: new Date().toISOString(),
  };

  // Append to existing notes
  const existingNotes = parseNotes(project.description);
  const allNotes = [...existingNotes, newNote];

  // Store notes as JSON in description, keeping any legacy text as the first entry
  const legacyText = extractLegacyDescription(project.description);
  const updatedDescription = serializeNotes(allNotes, legacyText);

  await prisma.project.update({
    where: { id },
    data: { description: updatedDescription },
  });

  return NextResponse.json(
    { note: newNote, total: allNotes.length },
    { status: 201 }
  );
}

// ─── Helpers ───

const NOTES_SENTINEL = "---NOTES_JSON---";

function parseNotes(description: string | null): NoteEntry[] {
  if (!description) return [];

  const idx = description.indexOf(NOTES_SENTINEL);
  if (idx === -1) return [];

  try {
    const jsonStr = description.slice(idx + NOTES_SENTINEL.length);
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function extractLegacyDescription(description: string | null): string {
  if (!description) return "";
  const idx = description.indexOf(NOTES_SENTINEL);
  if (idx === -1) return description;
  return description.slice(0, idx).trim();
}

function serializeNotes(notes: NoteEntry[], legacyText: string): string {
  const prefix = legacyText ? legacyText + "\n" : "";
  return prefix + NOTES_SENTINEL + JSON.stringify(notes);
}
