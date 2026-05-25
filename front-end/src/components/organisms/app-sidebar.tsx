"use client";

import { CalendarDays, Gauge, LogOut, Menu, MessageSquare, ScrollText, Settings, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.replace("/auth");
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-card/95 p-3 backdrop-blur md:hidden">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary text-foreground"
          onClick={() => setOpen(true)}
          aria-label="باز کردن منو"
          aria-expanded={open}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-primary">PersiaMehr CRM</div>
          <div className="text-[11px] text-muted-foreground">سیستم مدیریت ارتباط مشتری</div>
        </div>
        <div className="w-9" />
      </header>

      {open && <button type="button" className="fixed inset-0 z-40 bg-black/70 md:hidden" aria-label="بستن منو" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-72 max-w-[86vw] translate-x-full flex-col border-l border-border bg-card p-3 shadow-2xl transition-transform duration-200 md:static md:z-auto md:h-screen md:w-60 md:max-w-none md:translate-x-0 md:shadow-none",
          open && "translate-x-0",
        )}
      >
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-border px-1 pb-3 md:block md:px-2 md:pb-4">
        <div>
          <div className="text-sm font-bold text-primary">PersiaMehr CRM</div>
          <div className="mt-1 text-[11px] text-muted-foreground">سیستم مدیریت ارتباط مشتری</div>
        </div>
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          onClick={() => setOpen(false)}
          aria-label="بستن منو"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="space-y-1">
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
      <div className="mt-auto space-y-3 px-2">
        <div className="text-center text-[11px] leading-6 text-muted-foreground">
          {contactsCount} مخاطب · {eventsCount} رویداد
        </div>
        <Button type="button" variant="outline" className="w-full" onClick={logout}>
          <LogOut className="h-4 w-4" />
          خروج
        </Button>
      </div>
    </aside>
    </>
  );
}
