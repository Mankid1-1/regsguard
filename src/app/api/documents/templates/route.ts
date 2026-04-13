import { NextResponse } from "next/server";
import { TEMPLATE_REGISTRY } from "@/lib/documents/templates/registry";

export async function GET() {
  const templates = TEMPLATE_REGISTRY.map((t) => ({
    slug: t.slug,
    name: t.name,
    category: t.category,
    description: t.description,
    fields: t.fields,
  }));

  return NextResponse.json(templates);
}
