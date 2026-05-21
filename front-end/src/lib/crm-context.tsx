"use client";

import { createContext, useContext } from "react";
import { defaultSmsConfig, STORAGE_KEYS } from "@/lib/constants";
import { usePersistentStorage } from "@/hooks/use-persistent-storage";
import type { Contact, EventItem, SmsConfig, SmsLogItem } from "@/types/crm";

type CrmContextValue = {
  ready: boolean;
  contacts: Contact[];
  events: EventItem[];
  smsConfig: SmsConfig;
  smsLog: SmsLogItem[];
  customJobs: string[];
  customSpecs: string[];
  saveContact: (contact: Contact) => void;
  deleteContact: (id: number) => void;
  saveEvent: (event: EventItem) => void;
  deleteEvent: (id: string) => void;
  saveSmsConfig: (config: SmsConfig) => void;
  addSmsLog: (log: SmsLogItem) => void;
  addJob: (job: string) => void;
  addSpec: (spec: string) => void;
};

const CrmContext = createContext<CrmContextValue | null>(null);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [contacts, setContacts, contactsLoaded] = usePersistentStorage<Contact[]>(STORAGE_KEYS.contacts, []);
  const [events, setEvents, eventsLoaded] = usePersistentStorage<EventItem[]>(STORAGE_KEYS.events, []);
  const [smsConfig, setSmsConfig, smsConfigLoaded] = usePersistentStorage<SmsConfig>(STORAGE_KEYS.smsConfig, defaultSmsConfig);
  const [smsLog, setSmsLog, smsLogLoaded] = usePersistentStorage<SmsLogItem[]>(STORAGE_KEYS.smsLog, []);
  const [customJobs, setCustomJobs, customJobsLoaded] = usePersistentStorage<string[]>(STORAGE_KEYS.customJobs, []);
  const [customSpecs, setCustomSpecs, customSpecsLoaded] = usePersistentStorage<string[]>(STORAGE_KEYS.customSpecs, []);

  const saveContact = (contact: Contact) =>
    setContacts((previous) => previous.some((item) => item.id === contact.id) ? previous.map((item) => item.id === contact.id ? contact : item) : [...previous, contact]);

  const saveEvent = (event: EventItem) =>
    setEvents((previous) => previous.some((item) => item.id === event.id) ? previous.map((item) => item.id === event.id ? event : item) : [...previous, event]);

  const value: CrmContextValue = {
    ready: contactsLoaded && eventsLoaded && smsConfigLoaded && smsLogLoaded && customJobsLoaded && customSpecsLoaded,
    contacts,
    events,
    smsConfig,
    smsLog,
    customJobs,
    customSpecs,
    saveContact,
    deleteContact: (id) => setContacts((previous) => previous.filter((contact) => contact.id !== id)),
    saveEvent,
    deleteEvent: (id) => setEvents((previous) => previous.filter((event) => event.id !== id)),
    saveSmsConfig: setSmsConfig,
    addSmsLog: (log) => setSmsLog((previous) => [...previous, log]),
    addJob: (job) => setCustomJobs((previous) => previous.includes(job) ? previous : [...previous, job]),
    addSpec: (spec) => setCustomSpecs((previous) => previous.includes(spec) ? previous : [...previous, spec]),
  };

  return <CrmContext.Provider value={value}>{children}</CrmContext.Provider>;
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) throw new Error("useCrm must be used inside CrmProvider");
  return context;
}
