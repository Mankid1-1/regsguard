import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/webp",
];

const ALLOWED_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".heic", ".webp"];

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB for photos

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_PROJECTS);
  if (denied) return denied;

  const { id } = await params;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const photos = await prisma.jobPhoto.findMany({
    where: { projectId: id, userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(photos);
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

  const denied = guardPermission(user.role as Role, PERMISSIONS.UPLOAD_PHOTOS);
  if (denied) return denied;

  const { id } = await params;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: { id, userId: user.id },
    select: { id: true },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Parse multipart form data
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
      { error: "File too large. Maximum size is 15MB." },
      { status: 400 }
    );
  }

  // Validate file type
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_TYPES.includes(file.type) && !ALLOWED_IMAGE_EXTENSIONS.includes(ext)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed: PNG, JPG, JPEG, HEIC, WebP." },
      { status: 400 }
    );
  }

  // Optional fields
  const caption = (formData.get("caption") as string) || null;
  const latitudeStr = formData.get("latitude") as string | null;
  const longitudeStr = formData.get("longitude") as string | null;
  const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
  const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

  // Save file to disk: uploads/{userId}/photos/{timestamp}-{filename}
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${timestamp}-${sanitizedName}`;
  const uploadDir = path.join(process.cwd(), "uploads", user.id, "photos");
  const filePath = path.join(uploadDir, fileName);

  try {
    await mkdir(uploadDir, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);
  } catch {
    return NextResponse.json(
      { error: "Failed to save photo" },
      { status: 500 }
    );
  }

  // Create JobPhoto record
  const relativePath = path.join("uploads", user.id, "photos", fileName);

  const photo = await prisma.jobPhoto.create({
    data: {
      userId: user.id,
      projectId: id,
      filePath: relativePath,
      caption,
      latitude: latitude && !isNaN(latitude) ? latitude : null,
      longitude: longitude && !isNaN(longitude) ? longitude : null,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}
