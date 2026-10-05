"use client";

function pageList(page: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ["…" as const, n] : [n]));
}

const btn = "tnum inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2.5 text-[13px] font-medium transition-colors";

export default function Pagination({ total, page, pageSize, onPage }: { total: number; page: number; pageSize: number; onPage: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" disabled={page === 1} onClick={() => onPage(page - 1)} className={`${btn} border-line bg-surface text-muted hover:border-line-strong hover:text-ink disabled:opacity-40`}>Previous</button>
      {pageList(page, pages).map((n, i) =>
        n === "…" ? (
          <span key={`gap${i}`} className="px-1 text-faint" aria-hidden="true">…</span>
        ) : (
          <button key={n} type="button" onClick={() => onPage(n)} aria-current={n === page ? "page" : undefined} aria-label={`Page ${n}`} className={`${btn} ${n === page ? "border-ink bg-ink text-white" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"}`}>{n}</button>
        ),
      )}
      <button type="button" disabled={page === pages} onClick={() => onPage(page + 1)} className={`${btn} border-line bg-surface text-muted hover:border-line-strong hover:text-ink disabled:opacity-40`}>Next</button>
    </nav>
  );
}
