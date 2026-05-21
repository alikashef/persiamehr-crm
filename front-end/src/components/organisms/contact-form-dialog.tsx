"use client";

import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Field } from "@/components/atoms/field";
import { SectionTitle } from "@/components/atoms/section-title";
import { ComboSelect } from "@/components/molecules/combo-select";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CITY_CODE, JOBS, PROVINCES, SPECS } from "@/lib/constants";
import type { Contact } from "@/types/crm";

const emptyContact: Omit<Contact, "id"> = {
  name: "",
  company: "",
  phone1: "",
  phone2: "",
  phone3: "",
  address: "",
  postalCode: "",
  province: "",
  city: "",
  cityCode: "",
  specialty: "",
  job: "",
  nationalId: "",
};

type ContactFormDialogProps = {
  open: boolean;
  initial?: Contact | null;
  contacts: Contact[];
  customJobs: string[];
  customSpecs: string[];
  onClose: () => void;
  onSave: (contact: Contact) => void;
  onAddJob: (job: string) => void;
  onAddSpec: (spec: string) => void;
};

export function ContactFormDialog({ open, initial, contacts, customJobs, customSpecs, onClose, onSave, onAddJob, onAddSpec }: ContactFormDialogProps) {
  const [form, setForm] = useState<Contact>(initial || ({ ...emptyContact, id: nextId(contacts) } as Contact));
  const allJobs = useMemo(() => Array.from(new Set([...JOBS, ...customJobs])), [customJobs]);
  const allSpecs = useMemo(() => Array.from(new Set([...SPECS, ...customSpecs])), [customSpecs]);
  const cities = form.province ? PROVINCES[form.province] || [] : [];

  useEffect(() => {
    if (open) setForm(initial || ({ ...emptyContact, id: nextId(contacts) } as Contact));
  }, [contacts, initial, open]);

  const set = <K extends keyof Contact>(key: K, value: Contact[K]) => setForm((previous) => ({ ...previous, [key]: value }));

  return (
    <Dialog open={open} title={initial ? "ویرایش مخاطب" : "مخاطب جدید"} onClose={onClose} className="max-w-3xl">
      <SectionTitle>اطلاعات پایه</SectionTitle>
      <div className="grid gap-3 md:grid-cols-[90px_1fr_1fr]">
        <Field label="کد"><Input value={form.id} disabled /></Field>
        <Field label="نام و نام خانوادگی *"><Input value={form.name} onChange={(event) => set("name", event.target.value)} placeholder="نام کامل" /></Field>
        <Field label="کد ملی"><Input dir="ltr" value={form.nationalId || ""} onChange={(event) => set("nationalId", event.target.value)} maxLength={10} /></Field>
      </div>
      <Field label="نام شرکت / بیمارستان" className="mt-3"><Input value={form.company || ""} onChange={(event) => set("company", event.target.value)} /></Field>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <Field label="شغل">
          <ComboSelect value={form.job} options={allJobs} placeholder="انتخاب شغل" onChange={(value) => {
            set("job", value);
            if (value && !JOBS.includes(value)) onAddJob(value);
          }} />
        </Field>
        <Field label="تخصص">
          <ComboSelect value={form.specialty} options={allSpecs} placeholder="انتخاب تخصص" onChange={(value) => {
            set("specialty", value);
            if (value && !SPECS.includes(value)) onAddSpec(value);
          }} />
        </Field>
      </div>
      <SectionTitle>اطلاعات تماس</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="موبایل / واتس‌اپ اول"><Input dir="ltr" value={form.phone1 || ""} onChange={(event) => set("phone1", event.target.value)} /></Field>
        <Field label="واتس‌اپ دوم"><Input dir="ltr" value={form.phone2 || ""} onChange={(event) => set("phone2", event.target.value)} /></Field>
        <Field label="شماره ثابت"><Input dir="ltr" value={form.phone3 || ""} onChange={(event) => set("phone3", event.target.value)} /></Field>
        <Field label="کد شهر"><Input dir="ltr" value={form.cityCode || ""} onChange={(event) => set("cityCode", event.target.value)} /></Field>
      </div>
      <SectionTitle>محل</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="استان">
          <Select value={form.province || ""} onChange={(event) => {
            setForm((previous) => ({ ...previous, province: event.target.value, city: "", cityCode: "" }));
          }}>
            <option value="">انتخاب استان</option>
            {Object.keys(PROVINCES).map((province) => <option key={province} value={province}>{province}</option>)}
          </Select>
        </Field>
        <Field label="شهر">
          <Select value={form.city || ""} disabled={!form.province} onChange={(event) => {
            setForm((previous) => ({ ...previous, city: event.target.value, cityCode: CITY_CODE[event.target.value] || previous.cityCode }));
          }}>
            <option value="">انتخاب شهر</option>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="آدرس کامل" className="mt-3"><Textarea value={form.address || ""} onChange={(event) => set("address", event.target.value)} /></Field>
      <Field label="کد پستی" className="mt-3 max-w-48"><Input dir="ltr" value={form.postalCode || ""} onChange={(event) => set("postalCode", event.target.value)} /></Field>
      <div className="mt-5 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
        <Button type="button" onClick={() => {
          if (!form.name.trim()) return;
          onSave(form);
        }}>
          <Send className="h-4 w-4" />
          ذخیره
        </Button>
      </div>
    </Dialog>
  );
}

function nextId(contacts: Contact[]) {
  return contacts.length ? Math.max(...contacts.map((contact) => contact.id || 0)) + 1 : 1;
}
