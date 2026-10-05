"use client";
import { useCallback, useMemo, useSyncExternalStore } from "react";

const KEY = "gw:votes";
const VOTER = "gw:voter";
const listeners = new Set<() => void>();

const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "{}";
  } catch {
    return "{}";
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

/** Anonymous per-browser id so one reader cannot vote twice on a story. */
function voterId() {
  try {
    let v = localStorage.getItem(VOTER);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(VOTER, v);
    }
    return v;
  } catch {
    return "anon";
  }
}

export function useVotes() {
  const raw = useSyncExternalStore(subscribe, read, () => "{}");
  const votes = useMemo<Record<string, 1 | -1>>(() => {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }, [raw]);

  /** Clicking the active vote again removes it. */
  const vote = useCallback((id: string, v: 1 | -1) => {
    const cur: Record<string, 1 | -1> = JSON.parse(read());
    const next = cur[id] === v ? 0 : v;
    if (next === 0) delete cur[id];
    else cur[id] = next;
    try {
      localStorage.setItem(KEY, JSON.stringify(cur));
    } catch {}
    listeners.forEach((l) => l());
    fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, voter: voterId(), vote: next }) }).catch(() => {});
  }, []);

  return { votes, vote };
}
