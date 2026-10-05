"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "gw:saved";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};

export function useSaved() {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  const ids = useMemo<string[]>(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }, [raw]);
  const toggle = useCallback((id: string) => {
    const cur: string[] = JSON.parse(read());
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
    listeners.forEach((l) => l());
  }, []);
  return { ids, isSaved: (id: string) => ids.includes(id), toggle };
}
