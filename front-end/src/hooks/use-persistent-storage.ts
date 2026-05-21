"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL, defaultSmsConfig, STORAGE_KEYS } from "@/lib/constants";
import type { StorageShape } from "@/types/crm";

const allKeys = Object.values(STORAGE_KEYS);

let cache: Partial<StorageShape> | null = null;
let cacheLoaded = false;
let pendingSave: ReturnType<typeof setTimeout> | null = null;

async function fetchCache() {
  if (cacheLoaded) return cache;
  try {
    const response = await fetch(`${API_URL}?t=${Date.now()}`);
    if (response.ok) cache = await response.json() as Partial<StorageShape>;
  } catch {
    cache = null;
  }
  cacheLoaded = true;
  return cache;
}

function fallbackForKey(key: string) {
  if (key === STORAGE_KEYS.smsConfig) return defaultSmsConfig;
  return [];
}

function buildFull<T>(key: string, value: T) {
  const full: Record<string, unknown> = {};
  allKeys.forEach((storageKey) => {
    if (storageKey === key) full[storageKey] = value;
    else if (cache && storageKey in cache) full[storageKey] = cache[storageKey as keyof StorageShape];
    else {
      try {
        const stored = localStorage.getItem(storageKey);
        full[storageKey] = stored ? JSON.parse(stored) : fallbackForKey(storageKey);
      } catch {
        full[storageKey] = fallbackForKey(storageKey);
      }
    }
  });
  return full;
}

async function saveServer<T>(key: string, value: T) {
  const full = buildFull(key, value) as Partial<StorageShape>;
  cache = full;
  if (pendingSave) clearTimeout(pendingSave);
  pendingSave = setTimeout(async () => {
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full),
      });
    } catch {
      // Local storage remains the optimistic source if the PHP backend is absent.
    }
  }, 300);
}

export function usePersistentStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const isOnline = window.location.protocol !== "file:";
    if (isOnline) {
      fetchCache().then((data) => {
        if (data && key in data) setValue(data[key as keyof StorageShape] as T);
        else {
          try {
            const stored = localStorage.getItem(key);
            if (stored) setValue(JSON.parse(stored) as T);
          } catch {}
        }
        setLoaded(true);
      });
    } else {
      try {
        const stored = localStorage.getItem(key);
        if (stored) setValue(JSON.parse(stored) as T);
      } catch {}
      setLoaded(true);
    }
  }, [key]);

  const save = useCallback((nextValue: T | ((previous: T) => T)) => {
    setValue((previous) => {
      const resolved = typeof nextValue === "function" ? (nextValue as (old: T) => T)(previous) : nextValue;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {}
      if (window.location.protocol !== "file:") void saveServer(key, resolved);
      return resolved;
    });
  }, [key]);

  return [value, save, loaded] as const;
}
