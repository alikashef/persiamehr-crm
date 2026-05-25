"use client";

import { MessageCircle, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { Field } from "@/components/atoms/field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { nowTime, todaySh, uid } from "@/lib/date";
import type { Contact, SmsConfig, SmsLogItem, SendStatus } from "@/types/crm";

type MessageDialogProps = {
  open: boolean;
  mode: "sms" | "wa";
  contact?: Contact | null;
  contacts?: Contact[];
  config: SmsConfig;
  onClose: () => void;
  onLog: (log: SmsLogItem) => void;
};

export function SingleMessageDialog({ open, mode, contact, config, onClose, onLog }: MessageDialogProps) {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [phone, setPhone] = useState(contact?.phone1 || "");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<SendStatus | null>(null);
  const text = mode === "sms" ? [line1, line2].filter(Boolean).join("\n") : line1;

  useEffect(() => {
    if (!open) return;
    setPhone(contact?.phone1 || "");
    setLine1("");
    setLine2("");
    setStatus(null);
  }, [contact, open]);

  const send = async () => {
    if (mode === "sms" && (!config.apiKey || !config.from)) {
      setStatus({ ok: false, msg: "تنظیمات API پیامک ناقص است" });
      return;
    }
    if (mode === "wa" && (!config.waApiUrl || !config.waApiToken)) {
      setStatus({ ok: false, msg: "تنظیمات API واتس‌اپ ناقص است" });
      return;
    }
    if (!phone || !text.trim()) {
      setStatus({ ok: false, msg: "شماره و متن الزامی است" });
      return;
    }

    setSending(true);
    setStatus(null);
    try {
      const response = await fetch(mode === "sms" ? `https://api.melipayamak.com/api/send/simple/${config.apiKey}` : config.waApiUrl, {
        method: "POST",
        headers: mode === "sms" ? { "Content-Type": "application/json" } : { "Content-Type": "application/json", Authorization: `Bearer ${config.waApiToken}` },
        body: JSON.stringify(mode === "sms" ? { from: config.from, to: phone, text } : { to: phone, message: text }),
      });
      const payload = mode === "sms" ? await response.json().catch(() => ({})) : {};
      const ok = response.ok || Boolean((payload as { recid?: unknown; status?: number }).recid) || (payload as { status?: number }).status === 200;
      setStatus({ ok, msg: ok ? "ارسال شد" : `خطا: ${response.status}` });
      onLog({
        id: uid(),
        date: todaySh(),
        time: nowTime(),
        name: contact?.name || "-",
        company: contact?.company || "-",
        phone,
        text,
        status: ok ? "OK" : "FAIL",
        channel: mode === "sms" ? "SMS" : "WhatsApp",
      });
    } catch (error) {
      setStatus({ ok: false, msg: error instanceof Error ? error.message : "خطا در ارسال" });
    }
    setSending(false);
  };

  return (
    <Dialog open={open} title={`${mode === "sms" ? "ارسال پیامک" : "ارسال واتس‌اپ"}${contact ? ` - ${contact.name}` : ""}`} onClose={onClose}>
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="شماره گیرنده *"><Input dir="ltr" value={phone} onChange={(event) => setPhone(event.target.value)} /></Field>
        <Field label="نام"><Input value={contact?.name || ""} disabled /></Field>
      </div>
      {mode === "sms" ? (
        <>
          <Field label="خط اول پیام" className="mt-3"><Input value={line1} onChange={(event) => setLine1(event.target.value)} /></Field>
          <Field label="خط دوم پیام" className="mt-3"><Input value={line2} onChange={(event) => setLine2(event.target.value)} /></Field>
        </>
      ) : (
        <Field label="متن پیام *" className="mt-3"><Textarea value={line1} onChange={(event) => setLine1(event.target.value)} /></Field>
      )}
      <div className="mt-3 min-h-16 whitespace-pre-wrap rounded-md border border-border bg-secondary p-3 text-sm text-muted-foreground">{text || "پیش‌نمایش..."}</div>
      {status && <div className={`mt-3 rounded-md p-2 text-xs ${status.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{status.msg}</div>}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onClose}>بستن</Button>
        <Button type="button" variant="success" onClick={send} disabled={sending}>
          {mode === "sms" ? <Send className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
          {sending ? "در حال ارسال..." : "ارسال"}
        </Button>
      </div>
    </Dialog>
  );
}

export function BulkMessageDialog({ open, mode, contacts = [], config, onClose, onLog }: MessageDialogProps) {
  const [selected, setSelected] = useState(() => contacts.map((contact) => contact.id));
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [results, setResults] = useState<{ name: string; phone: string; ok: boolean }[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSelected(contacts.map((contact) => contact.id));
    setText("");
    setResults([]);
    setDone(false);
  }, [contacts, open]);

  const send = async () => {
    if (mode === "sms" && (!config.apiKey || !config.from)) return alert("تنظیمات API پیامک ناقص است");
    if (mode === "wa" && (!config.waApiUrl || !config.waApiToken)) return alert("تنظیمات API واتس‌اپ ناقص است");
    if (!text.trim() || selected.length === 0) return alert("متن و گیرنده الزامی است");
    setSending(true);
    const nextResults: { name: string; phone: string; ok: boolean }[] = [];
    for (const id of selected) {
      const contact = contacts.find((item) => item.id === id);
      if (!contact?.phone1) continue;
      try {
        const response = await fetch(mode === "sms" ? `https://api.melipayamak.com/api/send/simple/${config.apiKey}` : config.waApiUrl, {
          method: "POST",
          headers: mode === "sms" ? { "Content-Type": "application/json" } : { "Content-Type": "application/json", Authorization: `Bearer ${config.waApiToken}` },
          body: JSON.stringify(mode === "sms" ? { from: config.from, to: contact.phone1, text } : { to: contact.phone1, message: text }),
        });
        const ok = response.ok;
        nextResults.push({ name: contact.name, phone: contact.phone1, ok });
        onLog({ id: uid(), date: todaySh(), time: nowTime(), name: contact.name, company: contact.company || "-", phone: contact.phone1, text, status: ok ? "OK" : "FAIL", channel: mode === "sms" ? "SMS-گروهی" : "WA-گروهی" });
      } catch {
        nextResults.push({ name: contact.name, phone: contact.phone1, ok: false });
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    setResults(nextResults);
    setDone(true);
    setSending(false);
  };

  const toggle = (id: number) => setSelected((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]);

  return (
    <Dialog open={open} title={mode === "sms" ? "پیامک گروهی" : "واتس‌اپ گروهی"} onClose={onClose}>
      {!done ? (
        <>
          <Field label="متن پیام *"><Textarea value={text} onChange={(event) => setText(event.target.value)} /></Field>
          <div className="mt-3 min-h-16 whitespace-pre-wrap rounded-md border border-border bg-secondary p-3 text-sm text-muted-foreground">{text || "پیش‌نمایش..."}</div>
          <div className="my-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs text-muted-foreground">گیرندگان ({selected.length} نفر)</span>
            <Button type="button" variant="outline" size="sm" onClick={() => setSelected(selected.length === contacts.length ? [] : contacts.map((contact) => contact.id))}>
              {selected.length === contacts.length ? "لغو همه" : "انتخاب همه"}
            </Button>
          </div>
          <div className="max-h-56 overflow-y-auto rounded-md border border-border">
            {contacts.map((contact) => (
              <button type="button" key={contact.id} className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-2 border-b border-border px-3 py-2 text-right text-xs hover:bg-muted/50 sm:flex sm:items-center sm:gap-3" onClick={() => toggle(contact.id)}>
                <input type="checkbox" checked={selected.includes(contact.id)} onChange={() => toggle(contact.id)} onClick={(event) => event.stopPropagation()} />
                <span className="flex-1">{contact.name}</span>
                <span className="col-start-2 truncate text-muted-foreground">{contact.company}</span>
                <span className="ltr col-start-2 text-right text-muted-foreground sm:text-left">{contact.phone1}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={onClose}>انصراف</Button>
            <Button type="button" variant="success" onClick={send} disabled={sending || !text.trim() || selected.length === 0}>
              {sending ? `ارسال... (${results.length}/${selected.length})` : `ارسال به ${selected.length} نفر`}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 flex gap-2">
            <Badge variant="success">{results.filter((item) => item.ok).length} موفق</Badge>
            <Badge variant="danger">{results.filter((item) => !item.ok).length} ناموفق</Badge>
          </div>
          <div className="max-h-72 overflow-y-auto rounded-md border border-border">
            {results.map((result, index) => (
              <div key={`${result.phone}-${index}`} className="grid gap-1 border-b border-border px-3 py-2 text-xs sm:grid-cols-3 sm:gap-2">
                <span>{result.name}</span>
                <span className="ltr text-muted-foreground">{result.phone}</span>
                <Badge variant={result.ok ? "success" : "danger"}>{result.ok ? "OK" : "FAIL"}</Badge>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end"><Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose}>بستن</Button></div>
        </>
      )}
    </Dialog>
  );
}
