"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "./icons";

export default function FetchButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/refresh", { method: "POST" });
      const d = await res.json();
      if (res.status === 429) {
        const m = Math.ceil((d.retryAfter ?? 60) / 60);
        setMsg(`Updated a moment ago. Try again in ${m} min.`);
      } else if (!res.ok) {
        setMsg(d.error ?? "Could not fetch right now.");
      } else {
        const more = d.remaining > 0 ? ` ${d.remaining} more waiting, fetch again.` : " You are all caught up.";
        setMsg(`${d.stored} new ${d.stored === 1 ? "story" : "stories"}.${more}`);
        router.refresh();
      }
    } catch {
      setMsg("Could not reach the server. Check your connection.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5 sm:items-end">
      <button type="button" onClick={run} disabled={busy} className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-forest px-4 text-sm font-semibold text-white transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-80">
        <span className={busy ? "spin" : ""}><IconRefresh /></span>
        {busy ? "Reading German sources…" : "Fetch now"}
      </button>
      <p role="status" aria-live="polite" className="min-h-4 text-xs text-muted">{msg ?? (busy ? "This takes about a minute." : "")}</p>
    </div>
  );
}
