import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", {
  variants: {
    variant: {
      default: "bg-primary/15 text-primary",
      success: "bg-emerald-500/15 text-emerald-300",
      danger: "bg-red-500/15 text-red-300",
      warning: "bg-amber-500/15 text-amber-300",
      muted: "bg-muted text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
