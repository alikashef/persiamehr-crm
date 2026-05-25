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
    <div className="flex min-h-screen flex-col bg-background md:h-screen md:flex-row md:overflow-hidden">
      <AppSidebar contactsCount={contacts.length} eventsCount={events.length} />
      <main className="min-w-0 flex-1 p-3 sm:p-4 md:overflow-y-auto md:p-5">{children}</main>
    </div>
  );
}
