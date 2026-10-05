"use client";
import type { Article } from "@/lib/types";
import type { Sort, SortKey } from "@/lib/explore";
import { getCategory } from "@/lib/categories";
import { shortDate } from "@/lib/dates";
import ArticleActions from "./ArticleActions";
import { DeadlineStrip, Relevance } from "./ArticleCard";
import { IconArrow, IconExternal } from "./icons";

const COLS: { key: SortKey; label: string; cls: string }[] = [
  { key: "date", label: "Date", cls: "w-[88px]" },
  { key: "category", label: "Category", cls: "w-[170px]" },
  { key: "title", label: "Story", cls: "" },
  { key: "source", label: "Source", cls: "w-[130px]" },
  { key: "relevance", label: "Relevance", cls: "w-[110px]" },
  { key: "deadline", label: "Deadline", cls: "w-[170px]" },
];

export default function ArticleTable({ items, sort, onSort }: { items: Article[]; sort: Sort; onSort: (k: SortKey) => void }) {
  return (
    <div className="overflow-x-auto rounded-[10px] border border-line bg-surface">
      <table className="w-full min-w-[980px] border-collapse text-left text-[13.5px]">
        <thead>
          <tr className="border-b border-line bg-bg/60 text-xs text-muted">
            {COLS.map((c) => (
              <th key={c.key} scope="col" aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"} className={`${c.cls} px-4 py-2.5 font-semibold`}>
                <button type="button" onClick={() => onSort(c.key)} className="inline-flex items-center gap-1 hover:text-ink">
                  {c.label}
                  {sort.key === c.key && <IconArrow dir={sort.dir} />}
                </button>
              </th>
            ))}
            <th scope="col" className="w-[150px] px-4 py-2.5"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => {
            const cat = getCategory(a.category);
            return (
              <tr key={a.id} className="border-b border-line align-top last:border-0 hover:bg-bg/50">
                <td className="tnum whitespace-nowrap px-4 py-3 text-muted">{shortDate(a.published_at)}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: cat.fg }}>
                    <span className="size-2 shrink-0 rounded-[3px]" style={{ background: cat.dot }} />
                    {cat.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold leading-snug text-ink">{a.title_en}</div>
                  <div className="mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-muted">{a.summary_en}</div>
                  {a.why_it_matters && <div className="mt-1 text-[12.5px] font-medium text-forest">{a.why_it_matters}</div>}
                </td>
                <td className="px-4 py-3">
                  <a href={a.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-forest hover:underline">
                    {a.source_name} <IconExternal size={12} />
                  </a>
                </td>
                <td className="px-4 py-3"><Relevance score={a.relevance_score} /></td>
                <td className="px-4 py-3">
                  {a.deadline_date ? <DeadlineStrip date={a.deadline_date} compact /> : <span className="text-faint">{a.is_time_sensitive ? "Time-sensitive" : "-"}</span>}
                </td>
                <td className="px-2 py-2.5"><ArticleActions article={a} labels={false} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
