"use client";

import { CalendarDays, Gauge, LogOut, MessageSquare, ScrollText, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "داشبورد", icon: Gauge },
  { href: "/contacts", label: "مخاطبین", icon: Users },
  { href: "/events", label: "رویدادها", icon: CalendarDays, disabled: true },
  { href: "/messaging", label: "پیامک", icon: MessageSquare, disabled: true },
  { href: "/sms-log", label: "وضعیت ارسال", icon: ScrollText, disabled: true },
  { href: "/settings", label: "تنظیمات", icon: Settings, disabled: true },
] satisfies { href: string; label: string; icon: typeof Users; disabled?: boolean }[];

type AppSidebarProps = {
  contactsCount: number;
  eventsCount: number;
};

export function AppSidebar({ contactsCount, eventsCount }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace("/auth");
  };

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-card p-3 md:h-screen md:w-60 md:border-b-0 md:border-l">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-border px-1 pb-3 md:block md:px-2 md:pb-4">
        <div>
          <div className="text-sm font-bold text-primary">PersiaMehr CRM</div>
          <div className="mt-1 text-[11px] text-muted-foreground">سیستم مدیریت ارتباط مشتری</div>
        </div>
        <div className="text-left text-[11px] leading-5 text-muted-foreground md:hidden">
          {contactsCount} مخاطب<br />
          {eventsCount} رویداد
        </div>
      </div>
      <nav className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:block md:space-y-1">
        {nav.map((item) => {
          const content = (
            <>
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-right">{item.label}</span>
              {item.disabled && <span className="text-[10px] text-muted-foreground/70">غیرفعال</span>}
            </>
          );

          return item.disabled ? (
            <Button
              key={item.href}
              type="button"
              variant="ghost"
              disabled
              className="w-full cursor-not-allowed justify-start text-muted-foreground opacity-45"
            >
              {content}
            </Button>
          ) : (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn("w-full justify-start text-muted-foreground", pathname === item.href && "bg-primary/15 text-primary")}
            >
              <Link href={item.href}>{content}</Link>
            </Button>
          );
        })}
      </nav>
      <div className="mt-3 flex items-center justify-between gap-2 px-1 md:mt-auto md:block md:space-y-3 md:px-2">
        <div className="hidden text-center text-[11px] leading-6 text-muted-foreground md:block">
          {contactsCount} مخاطب · {eventsCount} رویداد
        </div>
        <Button type="button" variant="outline" className="w-full sm:w-auto md:w-full" onClick={logout}>
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
      </div>
    </aside>
  );
}
