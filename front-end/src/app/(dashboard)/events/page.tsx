"use client";

import { CalendarDays, FileDown, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/atoms/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SearchBox } from "@/components/molecules/search-box";
import { EventFormDialog } from "@/components/organisms/event-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportCSV } from "@/lib/csv";
import { todaySh } from "@/lib/date";
import type { EventItem } from "@/types/crm";
import { useCrm } from "@/lib/crm-context";

export default function Events() {
  const { events, contacts, saveEvent: onSave, deleteEvent: onDelete } = useCrm();
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [filter, setFilter] = useState<"all" | "today" | "next">("all");
  const [search, setSearch] = useState("");
  const today = todaySh();
  const getContact = (id: string | number) => contacts.find((contact) => String(contact.id) === String(id));

  const filtered = useMemo(() => events.filter((event) => {
    const matchFilter = filter === "today" ? event.date === today : filter === "next" ? event.nextDate === today : true;
    if (!matchFilter) return false;
    if (!search) return true;
    const contact = getContact(event.contactId);
    return event.description?.includes(search) || event.result?.includes(search) || (event.tags || []).some((tag) => tag.includes(search)) || contact?.name?.includes(search) || contact?.company?.includes(search);
  }), [events, filter, search, today]);

  const doExport = () => exportCSV("رویدادها.csv",
    ["تاریخ", "ساعت", "مخاطب", "شرکت", "شرح رویداد", "نتیجه", "پیگیری بعدی", "یادداشت"],
    filtered.map((event) => {
      const contact = getContact(event.contactId);
      return [event.date, event.time || "", contact?.name || "", contact?.company || "", event.description, event.result, event.nextDate, event.note];
    }),
  );

  return (
    <>
      <PageHeader title="رویدادها" icon={CalendarDays} actions={
        <>
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> چاپ</Button>
          <Button type="button" variant="outline" onClick={doExport}><FileDown className="h-4 w-4" /> اکسل</Button>
          <Button type="button" onClick={() => { setEditing(null); setModal(true); }}><Plus className="h-4 w-4" /> رویداد جدید</Button>
        </>
      } />
      <div className="mb-4 grid rounded-md bg-secondary p-1 md:grid-cols-3">
        {[["all", "همه"], ["today", "تماس‌های امروز"], ["next", "پیگیری‌های امروز"]].map(([key, label]) => (
          <button key={key} type="button" className={`rounded px-3 py-2 text-xs font-semibold ${filter === key ? "bg-muted text-primary" : "text-muted-foreground"}`} onClick={() => setFilter(key as "all" | "today" | "next")}>{label}</button>
        ))}
      </div>
      <SearchBox value={search} onChange={setSearch} placeholder="جستجو: تگ، شرح رویداد، نتیجه، نام مخاطب..." />
      {filtered.length === 0 ? <EmptyState>رویدادی یافت نشد</EmptyState> : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader><TableRow><TableHead>تاریخ</TableHead><TableHead>مخاطب</TableHead><TableHead>شرکت</TableHead><TableHead>شرح</TableHead><TableHead>نتیجه</TableHead><TableHead>تگ‌ها</TableHead><TableHead>پیگیری</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
            <TableBody>
              {[...filtered].reverse().map((event) => {
                const contact = getContact(event.contactId);
                return (
                  <TableRow key={event.id}>
                    <TableCell className="whitespace-nowrap">{event.date}</TableCell>
                    <TableCell className="text-primary">{contact?.name || "—"}</TableCell>
                    <TableCell>{contact?.company || "—"}</TableCell>
                    <TableCell className="max-w-44 truncate">{event.description}</TableCell>
                    <TableCell>{event.result || "—"}</TableCell>
                    <TableCell><div className="flex flex-wrap gap-1">{event.tags?.length ? event.tags.map((tag) => <Badge key={tag}>{tag}</Badge>) : "—"}</div></TableCell>
                    <TableCell>{event.nextDate ? <span className="text-amber-300">{event.nextDate}</span> : "—"}</TableCell>
                    <TableCell><div className="flex gap-1"><Button type="button" size="icon" variant="ghost" onClick={() => { setEditing(event); setModal(true); }}><Pencil className="h-4 w-4" /></Button><Button type="button" size="icon" variant="ghost" onClick={() => { if (confirm("حذف؟")) onDelete(event.id); }}><Trash2 className="h-4 w-4 text-red-300" /></Button></div></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
      <EventFormDialog open={modal} initial={editing} contact={editing ? getContact(editing.contactId) : null} contacts={contacts} events={events} onClose={() => { setModal(false); setEditing(null); }} onSave={(event) => { onSave(event); setModal(false); setEditing(null); }} />
    </>
  );
}
