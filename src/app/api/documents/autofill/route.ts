import { NextRequest, NextResponse } from "next/server";
import { getDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTemplate } from "@/lib/documents/templates/registry";
import { resolveAutoFill } from "@/lib/documents/generate-document";

export async function GET(request: NextRequest) {
  const user = await getDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const templateSlug = searchParams.get("templateSlug");
  const clientId = searchParams.get("clientId");
  const projectId = searchParams.get("projectId");

  if (!templateSlug) {
    return NextResponse.json({ error: "templateSlug required" }, { status: 400 });
  }

  const template = getTemplate(templateSlug);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  // Fetch data sources
  const [profile, client, project] = await Promise.all([
    prisma.businessProfile.findUnique({ where: { userId: user.id } }),
    clientId ? prisma.client.findFirst({ where: { id: clientId, userId: user.id } }) : null,
    projectId ? prisma.project.findFirst({ where: { id: projectId, userId: user.id } }) : null,
  ]);

  const filled = resolveAutoFill(template.fields, {
    profile: profile ? (profile as unknown as Record<string, unknown>) : undefined,
    client: client ? (client as unknown as Record<string, unknown>) : undefined,
    project: project ? (project as unknown as Record<string, unknown>) : undefined,
  });

  return NextResponse.json(filled);
}
