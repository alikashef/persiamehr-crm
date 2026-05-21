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
  { href: "/events", label: "رویدادها", icon: CalendarDays },
  { href: "/messaging", label: "پیامک", icon: MessageSquare },
  { href: "/sms-log", label: "وضعیت ارسال", icon: ScrollText },
  { href: "/settings", label: "تنظیمات", icon: Settings },
] satisfies { href: string; label: string; icon: typeof Users }[];

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
    <aside className="flex h-screen w-60 shrink-0 flex-col border-l border-border bg-card p-3">
      <div className="mb-3 border-b border-border px-2 pb-4">
        <div className="text-sm font-bold text-primary">PersiaMehr CRM</div>
        <div className="mt-1 text-[11px] text-muted-foreground">سیستم مدیریت ارتباط مشتری</div>
      </div>
      <nav className="space-y-1">
        {nav.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn("w-full justify-start text-muted-foreground", pathname === item.href && "bg-primary/15 text-primary")}
          >
            <Link href={item.href}>
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </Button>
        ))}
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
  );
}
