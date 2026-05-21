"use client";

import { Activity, CalendarClock, CheckCircle2, Gauge, MessageSquare, TrendingUp, Users } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/atoms/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { todaySh } from "@/lib/date";
import { useCrm } from "@/lib/crm-context";

export default function Dashboard() {
  const { contacts, events, smsLog } = useCrm();
  const today = todaySh();

  const todayEvents = useMemo(() => events.filter((event) => event.date === today), [events, today]);
  const todayFollowUps = useMemo(() => events.filter((event) => event.nextDate === today), [events, today]);
  const latestContacts = useMemo(() => [...contacts].slice(-5).reverse(), [contacts]);
  const latestLogs = useMemo(() => [...smsLog].slice(-5).reverse(), [smsLog]);
  const successfulMessages = smsLog.filter((item) => item.status === "OK").length;
  const successRate = smsLog.length ? Math.round((successfulMessages / smsLog.length) * 100) : 0;

  return (
    <>
      <PageHeader title="داشبورد" icon={Gauge} />

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="مخاطبین" value={contacts.length} icon={Users} tone="primary" caption="کل مخاطبین ثبت‌شده" />
        <MetricCard title="رویدادها" value={events.length} icon={CalendarClock} tone="warning" caption={`${todayEvents.length} رویداد برای امروز`} />
        <MetricCard title="پیگیری امروز" value={todayFollowUps.length} icon={Activity} tone="success" caption="موارد نیازمند اقدام" />
        <MetricCard title="موفقیت ارسال" value={`${successRate}%`} icon={MessageSquare} tone="primary" caption={`${successfulMessages} ارسال موفق از ${smsLog.length}`} />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent>
            <SectionHeading icon={TrendingUp} title="کارهای امروز" subtitle={today} />
            {todayEvents.length === 0 && todayFollowUps.length === 0 ? (
              <EmptyState className="py-8">برای امروز موردی ثبت نشده.</EmptyState>
            ) : (
              <div className="space-y-2">
                {[...todayFollowUps, ...todayEvents].slice(0, 6).map((event) => {
                  const contact = contacts.find((item) => String(item.id) === String(event.contactId));
                  const followUp = event.nextDate === today;
                  return (
                    <div key={`${event.id}-${followUp ? "follow" : "event"}`} className="rounded-md border border-border bg-secondary p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-sm font-bold">{contact?.name || "مخاطب نامشخص"}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{contact?.company || "بدون شرکت"}</div>
                        </div>
                        <Badge variant={followUp ? "warning" : "success"}>{followUp ? "پیگیری" : "رویداد"}</Badge>
                      </div>
                      <p className="mt-3 text-xs leading-6 text-muted-foreground">{event.description || event.result || "بدون توضیح"}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <SectionHeading icon={CheckCircle2} title="وضعیت پیامک" subtitle="آخرین ارسال‌ها" />
            {latestLogs.length === 0 ? (
              <EmptyState className="py-8">هنوز پیامی ارسال نشده.</EmptyState>
            ) : (
              <div className="space-y-2">
                {latestLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between gap-3 rounded-md border border-border bg-secondary px-3 py-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold">{log.name || "ارسال آزاد"}</div>
                      <div className="mt-1 truncate text-[11px] text-muted-foreground">{log.text}</div>
                    </div>
                    <Badge variant={log.status === "OK" ? "success" : "danger"}>{log.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-5">
        <Card className="overflow-hidden">
          <CardContent>
            <SectionHeading icon={Users} title="آخرین مخاطبین" subtitle="نمای سریع اطلاعات" />
          </CardContent>
          {latestContacts.length === 0 ? (
            <EmptyState className="py-8">هنوز مخاطبی ثبت نشده.</EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام</TableHead>
                  <TableHead>شرکت</TableHead>
                  <TableHead>شغل</TableHead>
                  <TableHead>شهر</TableHead>
                  <TableHead>موبایل</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestContacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-semibold">{contact.name}</TableCell>
                    <TableCell>{contact.company || "—"}</TableCell>
                    <TableCell>{contact.job || "—"}</TableCell>
                    <TableCell>{contact.city || "—"}</TableCell>
                    <TableCell className="ltr text-right">{contact.phone1 || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </>
  );
}

function MetricCard({ title, value, icon: Icon, caption, tone }: { title: string; value: number | string; icon: typeof Users; caption: string; tone: "primary" | "success" | "warning" }) {
  const toneClass = tone === "success" ? "bg-emerald-500/15 text-emerald-300" : tone === "warning" ? "bg-amber-500/15 text-amber-300" : "bg-primary/15 text-primary";

  return (
    <Card>
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted-foreground">{title}</div>
            <div className="mt-2 text-2xl font-bold">{value}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{caption}</div>
          </div>
          <div className={`flex h-10 w-10 items-center justify-center rounded-md ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeading({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: typeof Users }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <span className="text-[11px] text-muted-foreground">{subtitle}</span>
    </div>
  );
}
