import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Manage Regulations" };

export default async function AdminRegulationsPage() {
  const regulations = await prisma.regulation.findMany({
    orderBy: [{ state: "asc" }, { trade: "asc" }, { title: "asc" }],
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Regulations ({regulations.length})</h1>
        <Link href="/admin/regulations/new">
          <Button>Add Regulation</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-background">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="px-4 py-3 text-left font-medium">Title</th>
              <th className="px-4 py-3 text-left font-medium">Trade</th>
              <th className="px-4 py-3 text-left font-medium">State</th>
              <th className="px-4 py-3 text-left font-medium">Cycle</th>
              <th className="px-4 py-3 text-left font-medium">Category</th>
              <th className="px-4 py-3 text-left font-medium">Active</th>
              <th className="px-4 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {regulations.map((reg) => (
              <tr key={reg.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium">{reg.title}</td>
                <td className="px-4 py-3">{reg.trade}</td>
                <td className="px-4 py-3">{reg.state}</td>
                <td className="px-4 py-3">{reg.renewalCycle}</td>
                <td className="px-4 py-3 text-xs">{reg.category}</td>
                <td className="px-4 py-3">
                  <span className={reg.active ? "text-success" : "text-destructive"}>
                    {reg.active ? "Yes" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/regulations/${reg.id}/edit`}
                    className="text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
