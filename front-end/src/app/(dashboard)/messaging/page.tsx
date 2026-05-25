"use client";

import { MessageCircle, MessageSquare } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/atoms/empty-state";
import { PageHeader } from "@/components/molecules/page-header";
import { SearchBox } from "@/components/molecules/search-box";
import { BulkMessageDialog, SingleMessageDialog } from "@/components/organisms/message-dialogs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Contact, EventItem } from "@/types/crm";
import { useCrm } from "@/lib/crm-context";

type MessagingTab = "sms" | "sms-bulk" | "wa" | "wa-bulk";

export default function Messaging() {
  const { contacts, events, smsConfig: config, addSmsLog: onLog } = useCrm();
  const [tab, setTab] = useState<MessagingTab>("sms");
  const [search, setSearch] = useState("");
  const [contact, setContact] = useState<Contact | null>(null);
  const [singleMode, setSingleMode] = useState<"sms" | "wa">("sms");
  const [singleOpen, setSingleOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<"sms" | "wa" | null>(null);
  const filtered = useMemo(() => filterContacts(contacts, events, search), [contacts, events, search]);

  return (
    <>
      <PageHeader title="پیام‌رسانی" icon={MessageSquare} actions={
        <Button type="button" variant={tab.startsWith("wa") ? "success" : "default"} onClick={() => {
          if (tab.endsWith("bulk")) setBulkMode(tab.startsWith("wa") ? "wa" : "sms");
          else {
            setSingleMode(tab.startsWith("wa") ? "wa" : "sms");
            setContact(null);
            setSingleOpen(true);
          }
        }}>
          {tab.startsWith("wa") ? <MessageCircle className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          {tab.endsWith("bulk") ? "ارسال گروهی" : "ارسال آزاد"}
        </Button>
      } />
      <div className="mb-4 grid rounded-md bg-secondary p-1 sm:grid-cols-2 lg:grid-cols-4">
        {[["sms", "پیامک تکی"], ["sms-bulk", "پیامک گروهی"], ["wa", "واتس‌اپ تکی"], ["wa-bulk", "واتس‌اپ گروهی"]].map(([key, label]) => (
          <button key={key} type="button" className={`rounded px-3 py-2 text-xs font-semibold ${tab === key ? "bg-muted text-primary" : "text-muted-foreground"}`} onClick={() => setTab(key as MessagingTab)}>{label}</button>
        ))}
      </div>
      <SearchBox value={search} onChange={setSearch} placeholder="جستجو: نام، شرکت، شغل، تخصص، شهر، تگ..." />
      {filtered.length === 0 ? <EmptyState>مخاطبی یافت نشد</EmptyState> : (
        <Card className="overflow-x-auto">
          <Table>
            <TableHeader><TableRow><TableHead>نام</TableHead><TableHead>شرکت</TableHead><TableHead>شغل/تخصص</TableHead><TableHead>موبایل</TableHead><TableHead>ارسال</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold">{item.name}</TableCell>
                  <TableCell>{item.company}</TableCell>
                  <TableCell className="text-muted-foreground">{[item.job, item.specialty].filter(Boolean).join(" | ")}</TableCell>
                  <TableCell className="ltr text-right">{item.phone1}</TableCell>
                  <TableCell>
                    <Button type="button" size="sm" variant={tab.startsWith("wa") ? "success" : "outline"} onClick={() => {
                      setSingleMode(tab.startsWith("wa") ? "wa" : "sms");
                      setContact(item);
                      setSingleOpen(true);
                    }}>
                      ارسال
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
      <SingleMessageDialog open={singleOpen} mode={singleMode} contact={contact} config={config} onClose={() => { setSingleOpen(false); setContact(null); }} onLog={onLog} />
      <BulkMessageDialog open={Boolean(bulkMode)} mode={bulkMode || "sms"} contacts={filtered} config={config} onClose={() => setBulkMode(null)} onLog={onLog} />
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
