import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile, stat } from "fs/promises";
import path from "path";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".heic": "image/heic",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const upload = await prisma.fileUpload.findUnique({
    where: { id },
    select: { filePath: true, fileName: true, fileType: true, userId: true },
  });

  if (!upload) {
    return new NextResponse("Not found", { status: 404 });
  }

  const absPath = path.isAbsolute(upload.filePath)
    ? upload.filePath
    : path.join(process.cwd(), upload.filePath);

  const safeRoot = path.join(process.cwd(), "uploads");
  if (!absPath.startsWith(safeRoot)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    await stat(absPath);
    const buffer = await readFile(absPath);
    const ext = path.extname(upload.fileName).toLowerCase();
    const contentType = MIME[ext] || upload.fileType || "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new NextResponse("File missing on disk", { status: 404 });
  }
}
