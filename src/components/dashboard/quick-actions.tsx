"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";

export function QuickActions() {
  const router = useRouter();
  const { toast } = useToast();

  const actions = [
    {
      label: "Add Document",
      icon: "plus",
      onClick: () => router.push("/documents/new"),
      variant: "default" as const,
    },
    {
      label: "Verify License",
      icon: "check",
      onClick: () => router.push("/license-verification"),
      variant: "outline" as const,
    },
    {
      label: "Generate PDF",
      icon: "file",
      onClick: () => router.push("/documents/new"),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
