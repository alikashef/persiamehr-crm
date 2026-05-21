"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "@/components/atoms/field";
import { DatePicker } from "@/components/molecules/date-picker";
import { TagInput } from "@/components/molecules/tag-input";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { nowTime, todaySh, uid } from "@/lib/date";
import type { Contact, EventItem } from "@/types/crm";

type EventFormDialogProps = {
  open: boolean;
  initial?: EventItem | null;
  contact?: Contact | null;
  contacts: Contact[];
  events: EventItem[];
  onClose: () => void;
  onSave: (event: EventItem) => void;
};

const emptyEvent = (contact?: Contact | null): EventItem => ({
  id: uid(),
  date: todaySh(),
  description: "",
  result: "",
  nextDate: "",
  note: "",
  contactId: contact?.id || "",
  tags: [],
});

export function EventFormDialog({ open, initial, contact, contacts, events, onClose, onSave }: EventFormDialogProps) {
  const [form, setForm] = useState<EventItem>(initial || emptyEvent(contact));

  useEffect(() => {
    if (open) setForm(initial || emptyEvent(contact));
  }, [contact, initial, open]);

  const set = <K extends keyof EventItem>(key: K, value: EventItem[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <Dialog open={open} title={`${initial ? "ویرایش رویداد" : "ثبت رویداد جدید"}${contact ? ` - ${contact.name}` : ""}`} onClose={onClose}>
      {!contact && (
        <Field label="مخاطب *">
          <Select value={String(form.contactId || "")} onChange={(event) => set("contactId", Number(event.target.value) || event.target.value)}>
            <option value="">انتخاب مخاطب</option>
            {contacts.map((item) => <option key={item.id} value={item.id}>{item.name}{item.company ? ` (${item.company})` : ""}</option>)}
          </Select>
        </Field>
      )}
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="تاریخ رویداد *"><DatePicker value={form.date} onChange={(value) => set("date", value)} /></Field>
        <Field label="تاریخ پیگیری بعدی"><DatePicker value={form.nextDate || todaySh()} onChange={(value) => set("nextDate", value)} /></Field>
      </div>
      <Field label="شرح رویداد *" className="mt-3"><Textarea value={form.description} onChange={(event) => set("description", event.target.value)} /></Field>
      <Field label="نتیجه" className="mt-3"><Input value={form.result || ""} onChange={(event) => set("result", event.target.value)} /></Field>
      <Field label="تگ‌ها" className="mt-3"><TagInput tags={form.tags || []} events={events} onChange={(tags) => set("tags", tags)} /></Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="button" onClick={() => {
          if (!form.description.trim()) return;
          onSave({ ...form, time: form.time || nowTime() });
        }}>
          <Send className="h-4 w-4" />
          ذخیره
        </Button>
      </div>
    </Dialog>
  );
}
