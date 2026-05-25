"use client";

import { CalendarPlus, FileDown, FileUp, MessageSquare, Pencil, Plus, Printer, Trash2, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/atoms/empty-state";
import { SearchBox } from "@/components/molecules/search-box";
import { ContactFormDialog } from "@/components/organisms/contact-form-dialog";
import { EventFormDialog } from "@/components/organisms/event-form-dialog";
import { BulkMessageDialog, SingleMessageDialog } from "@/components/organisms/message-dialogs";
import { PageHeader } from "@/components/molecules/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { exportCSV, importContactsCSV } from "@/lib/csv";
import type { Contact, EventItem } from "@/types/crm";
import { useCrm } from "@/lib/crm-context";

export default function Contacts() {
  const {
    contacts,
    events,
    smsConfig,
    customJobs,
    customSpecs,
    saveContact: onSaveContact,
    deleteContact: onDeleteContact,
    saveEvent: onSaveEvent,
    addSmsLog: onSmsLog,
    addJob: onAddJob,
    addSpec: onAddSpec,
  } = useCrm();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Contact | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Contact | null>(null);
  const [eventContact, setEventContact] = useState<Contact | null>(null);
  const [smsContact, setSmsContact] = useState<Contact | null>(null);
  const [bulkSms, setBulkSms] = useState(false);

  const filtered = useMemo(() => filterContacts(contacts, events, search), [contacts, events, search]);
  const detailEvents = detail ? events.filter((event) => String(event.contactId) === String(detail.id)) : [];

  const doExport = () => exportCSV("مخاطبین.csv",
    ["کد", "نام", "شرکت", "شغل", "تخصص", "موبایل", "واتس‌اپ دوم", "ثابت", "کد شهر", "استان", "شهر", "کد ملی", "کد پستی", "آدرس"],
    contacts.map((contact) => [contact.id, contact.name, contact.company, contact.job, contact.specialty, contact.phone1, contact.phone2, contact.phone3, contact.cityCode, contact.province, contact.city, contact.nationalId, contact.postalCode, contact.address]),
  );

  return (
    <>
      <PageHeader title="مخاطبین" icon={Users} actions={
        <>
          <Button type="button" variant="warning" onClick={() => setBulkSms(true)}><Users className="h-4 w-4" /> پیامک گروهی</Button>
          <Button type="button" variant="outline" onClick={() => window.print()}><Printer className="h-4 w-4" /> چاپ</Button>
          <Button type="button" variant="outline" onClick={doExport}><FileDown className="h-4 w-4" /> اکسل</Button>
          <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-card px-3 text-xs font-semibold hover:bg-accent sm:px-4">
            <FileUp className="h-4 w-4" />
            ایمپورت اکسل
            <input type="file" accept=".csv" className="hidden" onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              importContactsCSV(file, (imported) => {
                if (!imported.length) return alert("هیچ ردیفی یافت نشد");
                if (!confirm(`${imported.length} مخاطب یافت شد. ایمپورت شود؟`)) return;
                imported.forEach(onSaveContact);
              }, alert);
              event.currentTarget.value = "";
            }} />
          </label>
          <Button type="button" onClick={() => { setEditing(null); setShowForm(true); }}><Plus className="h-4 w-4" /> مخاطب جدید</Button>
        </>
      } />
      <SearchBox value={search} onChange={setSearch} placeholder="جستجو: نام، شرکت، شغل، تخصص، شهر، استان..." />
      {filtered.length === 0 ? <EmptyState>مخاطبی یافت نشد</EmptyState> : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>کد</TableHead><TableHead>نام</TableHead><TableHead>شرکت</TableHead><TableHead>شغل</TableHead><TableHead>تخصص</TableHead><TableHead>موبایل</TableHead><TableHead>شهر</TableHead><TableHead>عملیات</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell><Badge variant="warning">{contact.id}</Badge></TableCell>
                  <TableCell><button type="button" className="font-semibold text-primary" onClick={() => setDetail(contact)}>{contact.name}</button></TableCell>
                  <TableCell>{contact.company}</TableCell>
                  <TableCell>{contact.job}</TableCell>
                  <TableCell>{contact.specialty}</TableCell>
                  <TableCell className="ltr text-right">{contact.phone1}</TableCell>
                  <TableCell>{contact.city}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button type="button" size="icon" variant="ghost" onClick={() => setSmsContact(contact)} title="پیامک"><MessageSquare className="h-4 w-4" /></Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => setEventContact(contact)} title="رویداد"><CalendarPlus className="h-4 w-4" /></Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => { setEditing(contact); setShowForm(true); }} title="ویرایش"><Pencil className="h-4 w-4" /></Button>
                      <Button type="button" size="icon" variant="ghost" onClick={() => { if (confirm(`حذف ${contact.name}؟`)) onDeleteContact(contact.id); }} title="حذف"><Trash2 className="h-4 w-4 text-red-300" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <ContactFormDialog open={showForm} initial={editing} contacts={contacts} customJobs={customJobs} customSpecs={customSpecs} onClose={() => { setShowForm(false); setEditing(null); }} onSave={(contact) => { onSaveContact(contact); setShowForm(false); setEditing(null); }} onAddJob={onAddJob} onAddSpec={onAddSpec} />
      <SingleMessageDialog open={Boolean(smsContact)} mode="sms" contact={smsContact} config={smsConfig} onClose={() => setSmsContact(null)} onLog={onSmsLog} />
      <BulkMessageDialog open={bulkSms} mode="sms" contacts={contacts} config={smsConfig} onClose={() => setBulkSms(false)} onLog={onSmsLog} />
      <EventFormDialog open={Boolean(eventContact)} contact={eventContact} contacts={contacts} events={events} onClose={() => setEventContact(null)} onSave={(event) => { onSaveEvent(event); setEventContact(null); }} />
      <Dialog open={Boolean(detail)} title={`پرونده: ${detail?.name || ""}`} onClose={() => setDetail(null)} className="max-w-3xl">
        {detail && (
          <>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <Info label="شرکت" value={detail.company} />
              <Info label="شغل" value={detail.job} />
              <Info label="تخصص" value={detail.specialty} />
              <Info label="استان" value={detail.province} />
              <Info label="شهر" value={detail.city} />
              <Info label="کد ملی" value={detail.nationalId} ltr />
            </div>
            <Info label="آدرس" value={detail.address} className="mt-3" />
            <div className="my-4 border-t border-border" />
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm font-bold">رویدادها ({detailEvents.length})</span>
              <Button type="button" variant="outline" size="sm" onClick={() => setEventContact(detail)}><Plus className="h-4 w-4" /> رویداد جدید</Button>
            </div>
            {detailEvents.length === 0 ? <EmptyState className="py-4">رویدادی ثبت نشده</EmptyState> : (
              <div className="space-y-2">
                {[...detailEvents].reverse().map((event) => (
                  <div key={event.id} className="rounded-md border border-border bg-secondary p-3 text-xs">
                    <div className="mb-1 flex justify-between gap-2"><b className="text-primary">{event.date}</b>{event.nextDate && <span className="text-amber-300">پیگیری: {event.nextDate}</span>}</div>
                    <p>{event.description}</p>
                    {event.result && <p className="mt-1 text-emerald-300">نتیجه: {event.result}</p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Dialog>
    </>
  );
}

function filterContacts(contacts: Contact[], events: EventItem[], search: string) {
  if (!search) return contacts;
  return contacts.filter((contact) =>
    contact.name?.includes(search) ||
    contact.company?.includes(search) ||
    contact.job?.includes(search) ||
    contact.specialty?.includes(search) ||
    contact.city?.includes(search) ||
    contact.province?.includes(search) ||
    events.filter((event) => String(event.contactId) === String(contact.id)).some((event) => (event.tags || []).some((tag) => tag.includes(search))),
  );
}

function Info({ label, value, ltr, className }: { label: string; value?: string; ltr?: boolean; className?: string }) {
  return <div className={className}><div className="text-[11px] text-muted-foreground">{label}</div><div className={ltr ? "ltr mt-1 text-right text-xs" : "mt-1 text-xs"}>{value || "—"}</div></div>;
}
