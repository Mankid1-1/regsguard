import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { RegulationForm } from "@/components/admin/regulation-form";

export const metadata = { title: "Edit Regulation" };

export default async function EditRegulationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const regulation = await prisma.regulation.findUnique({ where: { id } });
  if (!regulation) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Edit Regulation</h1>
      <RegulationForm regulation={regulation} />
    </div>
  );
}
