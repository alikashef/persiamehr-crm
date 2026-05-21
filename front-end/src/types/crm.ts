export type Contact = {
  id: number;
  name: string;
  company?: string;
  job?: string;
  specialty?: string;
  phone1?: string;
  phone2?: string;
  phone3?: string;
  cityCode?: string;
  province?: string;
  city?: string;
  nationalId?: string;
  postalCode?: string;
  address?: string;
};

export type EventItem = {
  id: string;
  contactId: number | string;
  date: string;
  time?: string;
  description: string;
  result?: string;
  nextDate?: string;
  note?: string;
  tags?: string[];
};

export type SmsConfig = {
  phone: string;
  apiKey: string;
  from: string;
  waApiUrl: string;
  waApiToken: string;
};

export type SmsLogItem = {
  id: string;
  date: string;
  time: string;
  name: string;
  company: string;
  phone: string;
  text: string;
  status: "OK" | "FAIL";
  channel: string;
};

export type CrmTab = "contacts" | "events" | "sms" | "log" | "settings";

export type StorageShape = {
  pm_contacts: Contact[];
  pm_events: EventItem[];
  pm_sms_config: SmsConfig;
  pm_sms_log: SmsLogItem[];
  pm_custom_jobs: string[];
  pm_custom_specs: string[];
};

export type SendStatus = {
  ok: boolean;
  msg: string;
};
