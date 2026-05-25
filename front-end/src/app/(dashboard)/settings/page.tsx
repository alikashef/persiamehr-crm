"use client";

import { Save, Settings as SettingsIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "@/components/atoms/field";
import { SectionTitle } from "@/components/atoms/section-title";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { defaultSmsConfig } from "@/lib/constants";
import type { SmsConfig } from "@/types/crm";
import { useCrm } from "@/lib/crm-context";

export default function Settings() {
  const { smsConfig: config, saveSmsConfig: onSave } = useCrm();
  const [form, setForm] = useState<SmsConfig>({ ...defaultSmsConfig, ...config });
  const [saved, setSaved] = useState(false);

  useEffect(() => setForm({ ...defaultSmsConfig, ...config }), [config]);

  const set = <K extends keyof SmsConfig>(key: K, value: SmsConfig[K]) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <>
      <PageHeader title="تنظیمات" icon={SettingsIcon} />
      <SectionTitle>ملی پیامک</SectionTitle>
      <Card className="max-w-xl"><CardContent className="space-y-3">
        <Field label="شماره حساب کاربری"><Input dir="ltr" value={form.phone} onChange={(event) => set("phone", event.target.value)} /></Field>
        <Field label="API Key"><Input dir="ltr" value={form.apiKey} onChange={(event) => set("apiKey", event.target.value)} /></Field>
        <Field label="FROM (شماره ارسال)"><Input dir="ltr" value={form.from} onChange={(event) => set("from", event.target.value)} /></Field>
      </CardContent></Card>
      <SectionTitle>واتس‌اپ API</SectionTitle>
      <Card className="max-w-xl"><CardContent className="space-y-3">
        <Field label="API URL"><Input dir="ltr" value={form.waApiUrl} onChange={(event) => set("waApiUrl", event.target.value)} /></Field>
        <Field label="API Token"><Input dir="ltr" value={form.waApiToken} onChange={(event) => set("waApiToken", event.target.value)} /></Field>
        <p className="text-[11px] text-muted-foreground">پارامترهای ارسال: to (شماره)، message (متن)</p>
      </CardContent></Card>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="button" onClick={save}><Save className="h-4 w-4" /> ذخیره تنظیمات</Button>
        {saved && <span className="text-xs text-emerald-300">ذخیره شد</span>}
      </div>
    </>
  );
}
