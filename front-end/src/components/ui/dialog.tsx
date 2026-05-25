import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DialogProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
};

export function Dialog({ open, title, children, onClose, className }: DialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-2 backdrop-blur-sm sm:items-center sm:p-3"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className={cn("max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-border bg-card p-3 shadow-2xl sm:p-5", className)}>
        <header className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-sm font-bold">{title}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="بستن">
            <X className="h-4 w-4" />
          </Button>
        </header>
        {children}
      </section>
    </div>
  );
}
