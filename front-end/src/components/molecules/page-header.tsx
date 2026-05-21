import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
};

export function PageHeader({ title, icon: Icon, actions }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="flex items-center gap-2 text-lg font-bold">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h1>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
