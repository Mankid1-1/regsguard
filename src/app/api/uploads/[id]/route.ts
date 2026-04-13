import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { readFile, unlink } from "fs/promises";
import path from "path";

const CONTENT_TYPE_MAP: Record<string, string> = {
  "application/pdf": "application/pdf",
  "image/png": "image/png",
  "image/jpeg": "image/jpeg",
  "image/jpg": "image/jpeg",
  "image/heic": "image/heic",
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  heic: "image/heic",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const upload = await prisma.fileUpload.findFirst({
    where: { id, userId: user.id },
  });

  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const absolutePath = path.join(process.cwd(), upload.filePath);
    const fileBuffer = await readFile(absolutePath);

    const contentType =
      CONTENT_TYPE_MAP[upload.fileType] ||
      CONTENT_TYPE_MAP[path.extname(upload.fileName).replace(".", "").toLowerCase()] ||
      "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${upload.fileName}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "File not found on disk" },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_DOCUMENTS);
  if (denied) return denied;

  const { id } = await params;

  const upload = await prisma.fileUpload.findFirst({
    where: { id, userId: user.id },
  });

  if (!upload) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete from disk
  try {
    const absolutePath = path.join(process.cwd(), upload.filePath);
    await unlink(absolutePath);
  } catch {
    // File may already be missing from disk; continue with DB cleanup
  }

  // Delete from database
  await prisma.fileUpload.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
