import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DashboardShell } from "./dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the user's role from our DB for the sidebar
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return (
    <DashboardShell userRole={user?.role}>
      {children}
    </DashboardShell>
  );
}
