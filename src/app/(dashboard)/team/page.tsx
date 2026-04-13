import type { Metadata } from "next";
import { TeamList } from "@/components/team/team-list";

export const metadata: Metadata = {
  title: "Team Management",
};

export default function TeamPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <TeamList />
    </div>
  );
}
