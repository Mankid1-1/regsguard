"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast";

interface DashboardShellProps {
  children: React.ReactNode;
  userRole?: string;
  onboardingComplete?: boolean;
}

export function DashboardShell({
  children,
  userRole,
  onboardingComplete = true,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to onboarding if not complete (unless already there)
  useEffect(() => {
    if (!onboardingComplete && !pathname.startsWith("/onboarding")) {
      router.replace("/onboarding");
    }
  }, [onboardingComplete, pathname, router]);

  return (
    <ToastProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          userRole={userRole}
        />

        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
          <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
            {children}
            <Footer />
          </main>
        </div>

        <MobileNav />
      </div>
    </ToastProvider>
  );
}
