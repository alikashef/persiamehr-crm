"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "@/components/organisms/app-sidebar";
import { AUTH_STORAGE_KEY } from "@/lib/constants";
import { CrmProvider, useCrm } from "@/lib/crm-context";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CrmProvider>
      <DashboardContent>{children}</DashboardContent>
    </CrmProvider>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, contacts, events } = useCrm();
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(AUTH_STORAGE_KEY) !== "active") {
      router.replace("/auth");
      return;
    }
    setAuthenticated(true);
  }, [router]);

  if (!authenticated || !ready) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-sm">در حال بارگذاری...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <AppSidebar contactsCount={contacts.length} eventsCount={events.length} />
      <main className="flex-1 overflow-y-auto p-5">{children}</main>
    </div>
  );
}
