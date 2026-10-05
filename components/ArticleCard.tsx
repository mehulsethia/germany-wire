"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import { deadlineParts, shortDate } from "@/lib/dates";
import { reelScript } from "@/lib/reel";
import { useSaved } from "@/lib/useSaved";

function DeadlineTile({ date }: { date: string }) {
  const { month, day, relative, full } = deadlineParts(date);
  return (
    <div className="shrink-0 text-center" title={full} aria-label={`Date to remember: ${full}, ${relative}`}>
      <div className="w-[3.75rem] overflow-hidden rounded-xl border border-amber/40 bg-amber-wash">
        <div className="bg-amber px-1 py-0.5 text-xs font-semibold text-white">{month}</div>
        <div className="font-serif text-2xl font-semibold leading-none text-amber-ink pb-1.5 pt-1">{day}</div>
      </div>
      <div className="mt-1 text-xs text-amber-ink">{relative}</div>
    </div>
  );
}

const iconProps = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export default function ArticleCard({ article: a }: { article: Article }) {
  const cat = getCategory(a.category);
  const { isSaved, toggle } = useSaved();
  const saved = isSaved(a.id);
  const [showDe, setShowDe] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(reelScript(a));
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.prompt("Copy this script:", reelScript(a));
    }
  }

  const btn =
    "inline-flex min-h-11 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors";

  return (
    <article id={`a-${a.id}`} className="rounded-3xl border border-line bg-paper p-5 shadow-soft sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-soft">
            <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[0.8rem] font-semibold" style={{ background: cat.bg, color: cat.fg }}>
              <span className="size-2 rounded-full" style={{ background: cat.dot }} />
              {cat.label}
            </span>
            <time dateTime={a.published_at}>{shortDate(a.published_at)}</time>
            {a.is_time_sensitive && !a.deadline_date && (
              <span className="rounded-full bg-amber-wash px-2.5 py-1 text-[0.8rem] font-semibold text-amber-ink">Time-sensitive</span>
            )}
          </div>
          <h2 className="font-serif text-[1.4rem] font-semibold leading-snug tracking-tight text-ink sm:text-2xl">{a.title_en}</h2>
        </div>
        {a.deadline_date && <DeadlineTile date={a.deadline_date} />}
      </div>

      <p className="mt-3 text-[1.0625rem] leading-[1.7] text-ink-soft">{a.summary_en}</p>

      {showDe && (
        <p lang="de" className="mt-3 rounded-2xl bg-sage-wash px-4 py-3 text-[0.95rem] leading-relaxed text-sage-deep">
          {a.title_de}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line pt-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-sage-deep underline decoration-sage/50 underline-offset-4 hover:decoration-sage-deep">
            Original in German · {a.source_name}
            <svg {...iconProps} width={14} height={14}><path d="M7 17 17 7M8 7h9v9" /></svg>
          </a>
          <button type="button" onClick={() => setShowDe((v) => !v)} aria-expanded={showDe} className="min-h-11 text-ink-faint hover:text-ink">
            {showDe ? "Hide German headline" : "Show German headline"}
          </button>
        </div>
        <div className="-mr-2 flex items-center gap-1">
          <button type="button" onClick={copy} className={`${btn} text-ink-soft hover:bg-sage-wash`}>
            <svg {...iconProps}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
            <span aria-live="polite">{copied ? "Copied" : "Copy reel script"}</span>
          </button>
          <button type="button" onClick={() => toggle(a.id)} aria-pressed={saved} className={`${btn} ${saved ? "bg-sage-wash text-sage-deep" : "text-ink-soft hover:bg-sage-wash"}`}>
            <svg {...iconProps} fill={saved ? "currentColor" : "none"}><path d="M6 4h12v17l-6-4-6 4z" /></svg>
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}
