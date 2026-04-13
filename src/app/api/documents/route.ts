import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import { parsePaginationParams, buildPaginatedResponse } from "@/lib/pagination";
import type { Role } from "@prisma/client";
import { getTemplate, TEMPLATE_REGISTRY } from "@/lib/documents/templates/registry";
import { z } from "zod";

const createSchema = z.object({
  templateSlug: z.string(),
  title: z.string().min(1),
  clientId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  data: z.record(z.string(), z.string()).default({}),
});

export async function GET(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = await rateLimit(user.id, { limit: 30, windowSec: 60 });
  if (limited) return limited;

  const denied = guardPermission(user.role as Role, PERMISSIONS.VIEW_DOCUMENTS);
  if (denied) return denied;

  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const { cursor, take } = parsePaginationParams(searchParams);

  const where = {
    userId: user.id,
    ...(category ? { category: category as never } : {}),
  };

  const documents = await prisma.document.findMany({
    where,
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      client: { select: { id: true, name: true, companyName: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(buildPaginatedResponse(documents, take));
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

  const body = await request.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const template = getTemplate(parsed.data.templateSlug);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const doc = await prisma.document.create({
    data: {
      userId: user.id,
      templateSlug: parsed.data.templateSlug,
      category: template.category,
      title: parsed.data.title,
      clientId: parsed.data.clientId || null,
      projectId: parsed.data.projectId || null,
      data: parsed.data.data,
    },
  });

  // Log the action
  await prisma.complianceLog.create({
    data: {
      userId: user.id,
      action: "DOCUMENT_CREATED",
      details: { templateSlug: template.slug, title: parsed.data.title, documentId: doc.id },
    },
  });

  return NextResponse.json(doc, { status: 201 });
}
