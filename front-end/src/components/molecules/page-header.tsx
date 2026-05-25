import type { LucideIcon } from "lucide-react";

type PageHeaderProps = {
  title: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
};

export function PageHeader({ title, icon: Icon, actions }: PageHeaderProps) {
  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="flex min-w-0 items-center gap-2 text-base font-bold sm:text-lg">
        <Icon className="h-5 w-5 text-primary" />
        {title}
      </h1>
      {actions && <div className="grid grid-cols-2 gap-2 [&>*]:w-full sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:[&>*]:w-auto">{actions}</div>}
    </header>
  );
}
