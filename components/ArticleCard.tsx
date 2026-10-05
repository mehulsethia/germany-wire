"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { getCategory } from "@/lib/categories";
import { deadlineParts, shortDate } from "@/lib/dates";
import ArticleActions from "./ArticleActions";
import { IconCalendar, IconExternal } from "./icons";

export function Relevance({ score }: { score: number }) {
  return (
    <span className="tnum inline-flex items-center gap-1.5 text-xs text-faint" title={`Relevance ${score}/100`}>
      <span className="h-1 w-8 overflow-hidden rounded-full bg-line">
        <span className="block h-full rounded-full bg-forest" style={{ width: `${score}%` }} />
      </span>
      {score}
    </span>
  );
}

export function DeadlineStrip({ date, compact }: { date: string; compact?: boolean }) {
  const d = deadlineParts(date);
  if (d.days < 0) return null;
  return (
    <span className={`inline-flex items-center gap-2 rounded-md bg-amber-wash text-amber-ink ${compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-[13px]"}`}>
      <IconCalendar size={compact ? 13 : 15} />
      <span className="font-semibold">{d.full}</span>
      <span suppressHydrationWarning className="opacity-80">{d.relative}</span>
    </span>
  );
}

export default function ArticleCard({ article: a }: { article: Article }) {
  const cat = getCategory(a.category);
  const [showDe, setShowDe] = useState(false);
  const hasDeadline = a.deadline_date && deadlineParts(a.deadline_date).days >= 0;

  return (
    <article id={`a-${a.id}`} className="flex h-full flex-col rounded-[10px] border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="inline-flex min-w-0 items-center gap-1.5 font-semibold" style={{ color: cat.fg }}>
          <span className="size-2 shrink-0 rounded-[3px]" style={{ background: cat.dot }} />
          <span className="truncate">{cat.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3 text-faint">
          {a.is_time_sensitive && !hasDeadline && <span className="font-semibold text-amber">Time-sensitive</span>}
          <time dateTime={a.published_at} className="tnum">{shortDate(a.published_at)}</time>
        </span>
      </div>

      <h3 className="mt-3 text-[17px] font-semibold leading-[1.3] tracking-[-0.015em] text-ink">{a.title_en}</h3>
      <p className="mt-2 text-[14px] leading-[1.6] text-muted">{a.summary_en}</p>

      {a.why_it_matters && (
        <p className="mt-3 border-l-2 border-forest pl-3 text-[13.5px] font-medium leading-snug text-forest">{a.why_it_matters}</p>
      )}

      {hasDeadline && (
        <div className="mt-3.5">
          <DeadlineStrip date={a.deadline_date!} />
        </div>
      )}

      {showDe && (
        <p lang="de" className="mt-3 border-l-2 border-forest/30 pl-3 text-[13px] italic leading-relaxed text-muted">{a.title_de}</p>
      )}

      <div className="mt-auto pt-4">
        <div className="flex items-center justify-between border-t border-line pt-3">
          <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] font-medium text-forest underline-offset-4 hover:underline" title="Open the original German source">
            {a.source_name} <IconExternal size={13} />
          </a>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setShowDe((v) => !v)} aria-expanded={showDe} className="text-xs font-medium text-faint hover:text-ink" title="Show the original German headline">
              {showDe ? "Hide DE" : "DE title"}
            </button>
            <Relevance score={a.relevance_score} />
          </div>
        </div>
        <div className="-mx-2 mt-2">
          <ArticleActions article={a} />
        </div>
      </div>
    </article>
  );
}
