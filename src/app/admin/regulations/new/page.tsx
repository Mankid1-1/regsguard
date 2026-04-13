import { RegulationForm } from "@/components/admin/regulation-form";

export const metadata = { title: "Add Regulation" };

export default function NewRegulationPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Add New Regulation</h1>
      <RegulationForm />
    </div>
  );
}
