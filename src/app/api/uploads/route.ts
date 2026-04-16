import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
];

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".heic"];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function validateUploadOwnership(userId: string, documentId?: string | null): Promise<string | null> {
  if (documentId) {
    const doc = await prisma.document.findUnique({
      where: { id: documentId },
      select: { userId: true },
    });
    if (!doc || doc.userId !== userId) {
      return "You do not own this document";
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const documentId = searchParams.get("documentId");

  const uploads = await prisma.fileUpload.findMany({
    where: {
      userId: user.id,
      ...(documentId ? { documentId } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(uploads);
}

export async function POST(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 10, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.MANAGE_DOCUMENTS);
  if (denied) return denied;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let formData: any;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10MB." },
      { status: 400 }
    );
  }

  // Validate file type by MIME type
  if (!ALLOWED_TYPES.includes(file.type)) {
    // Fallback: check extension
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PDF, PNG, JPG, JPEG, HEIC." },
        { status: 400 }
      );
    }
  }

  // Optional documentId linkage
  const documentId = formData.get("documentId") as string | null;

  // Validate document ownership
  const ownershipError = await validateUploadOwnership(user.id, documentId);
  if (ownershipError) {
    return NextResponse.json({ error: ownershipError }, { status: 400 });
  }

  // Build the upload path: uploads/{userId}/{timestamp}-{filename}
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const uploadDir = path.join(process.cwd(), "uploads", user.id);
  const filePath = path.join(uploadDir, fileName);

  try {
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });

    // Write the file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } catch {
    return NextResponse.json(
      { error: "Failed to save file" },
      { status: 500 }
    );
  }

  // Create the database record
  const upload = await prisma.fileUpload.create({
    data: {
      userId: user.id,
      documentId: documentId || null,
      fileName: file.name,
      fileType: file.type || path.extname(file.name).replace(".", ""),
      fileSize: file.size,
      filePath: path.join("uploads", user.id, fileName),
    },
  });

  return NextResponse.json(upload, { status: 201 });
}
