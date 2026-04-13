import { cn } from "@/lib/utils/cn";
import { HTMLAttributes, forwardRef } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "bg-primary/10 text-primary border-primary/20",
      secondary:
        "bg-muted text-muted-foreground border-border",
      success:
        "bg-success/10 text-success border-success/20",
      warning:
        "bg-warning/10 text-warning border-warning/20",
      danger:
        "bg-danger/10 text-danger border-danger/20",
      outline:
        "bg-transparent text-foreground border-border",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";
export { Badge };
