import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { guardPermission, PERMISSIONS } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { getTemplate } from "@/lib/documents/templates/registry";
import { resolveAutoFill } from "@/lib/documents/generate-document";

const MAX_BATCH_SIZE = 50;

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
  const { templateSlug, projectIds, clientIds } = body;

  if (!templateSlug || typeof templateSlug !== "string") {
    return NextResponse.json(
      { error: "templateSlug is required" },
      { status: 400 }
    );
  }

  const template = getTemplate(templateSlug);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  const pIds: string[] = Array.isArray(projectIds) ? projectIds : [];
  const cIds: string[] = Array.isArray(clientIds) ? clientIds : [];

  if (pIds.length === 0 && cIds.length === 0) {
    return NextResponse.json(
      { error: "Provide at least one projectId or clientId" },
      { status: 400 }
    );
  }

  const totalCount = pIds.length + cIds.length;
  if (totalCount > MAX_BATCH_SIZE) {
    return NextResponse.json(
      { error: `Maximum ${MAX_BATCH_SIZE} documents per batch` },
      { status: 400 }
    );
  }

  // Fetch business profile for auto-fill
  const profile = await prisma.businessProfile.findUnique({
    where: { userId: user.id },
  });

  // Fetch all referenced projects and clients owned by the user
  const [projects, clients] = await Promise.all([
    pIds.length > 0
      ? prisma.project.findMany({
          where: { id: { in: pIds }, userId: user.id },
          include: {
            client: true,
          },
        })
      : [],
    cIds.length > 0
      ? prisma.client.findMany({
          where: { id: { in: cIds }, userId: user.id },
        })
      : [],
  ]);

  const createdDocIds: string[] = [];
  const errors: { ref: string; error: string }[] = [];

  // Generate documents for each project
  for (const project of projects) {
    try {
      const autoFilled = resolveAutoFill(template.fields, {
        profile: profile
          ? (profile as unknown as Record<string, unknown>)
          : undefined,
        client: project.client
          ? (project.client as unknown as Record<string, unknown>)
          : undefined,
        project: project as unknown as Record<string, unknown>,
      });

      const title = `${template.name} - ${project.name}`;

      const doc = await prisma.document.create({
        data: {
          userId: user.id,
          templateSlug: template.slug,
          category: template.category,
          title,
          clientId: project.clientId || null,
          projectId: project.id,
          data: autoFilled,
        },
      });

      createdDocIds.push(doc.id);
    } catch (err) {
      errors.push({
        ref: `project:${project.id}`,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Generate documents for each standalone client (not already covered by projects)
  for (const client of clients) {
    try {
      const autoFilled = resolveAutoFill(template.fields, {
        profile: profile
          ? (profile as unknown as Record<string, unknown>)
          : undefined,
        client: client as unknown as Record<string, unknown>,
      });

      const title = `${template.name} - ${client.name}`;

      const doc = await prisma.document.create({
        data: {
          userId: user.id,
          templateSlug: template.slug,
          category: template.category,
          title,
          clientId: client.id,
          data: autoFilled,
        },
      });

      createdDocIds.push(doc.id);
    } catch (err) {
      errors.push({
        ref: `client:${client.id}`,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  // Create compliance log for bulk generation
  if (createdDocIds.length > 0) {
    await prisma.complianceLog.create({
      data: {
        userId: user.id,
        action: "BULK_GENERATED",
        details: {
          templateSlug: template.slug,
          documentIds: createdDocIds,
          count: createdDocIds.length,
        },
      },
    });
  }

  return NextResponse.json({
    created: createdDocIds.length,
    documentIds: createdDocIds,
    errors: errors.length > 0 ? errors : undefined,
  });
}
