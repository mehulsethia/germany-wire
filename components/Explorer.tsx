"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Article } from "@/lib/types";
import { CATEGORIES } from "@/lib/categories";
import { timeAgo } from "@/lib/dates";
import {
  DEFAULT_FILTERS, DEFAULT_SORT, SORT_OPTIONS, applyFilters, applySort, defaultDir, isFiltered, pickDigest,
  type Filters, type Sort, type SortKey,
} from "@/lib/explore";
import { useSaved } from "@/lib/useSaved";
import { useVotes } from "@/lib/useVotes";
import ArticleCard from "./ArticleCard";
import ArticleTable from "./ArticleTable";
import EmptyState from "./EmptyState";
import FetchButton from "./FetchButton";
import Pagination from "./Pagination";
import { IconGrid, IconSearch, IconTable, IconX } from "./icons";

const PAGE_SIZES = [20, 50, 100, 200];

/** True at tablet width and up. The table needs room, so phones always get cards. */
function useIsWide() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia("(min-width: 768px)");
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia("(min-width: 768px)").matches,
    () => true,
  );
}

type Props = { articles: Article[]; nowIso: string; lastUpdated: string | null; greeting: string; today: string; demo: boolean };

const select = "h-9 rounded-lg border border-line bg-surface px-2.5 text-[13px] font-medium text-ink hover:border-line-strong focus:border-forest";
const toggleCls = (on: boolean) =>
  `inline-flex h-9 items-center rounded-lg border px-3 text-[13px] font-medium transition-colors ${on ? "border-forest bg-forest text-white" : "border-line bg-surface text-muted hover:border-line-strong hover:text-ink"}`;

export default function Explorer({ articles, nowIso, lastUpdated, greeting, today, demo }: Props) {
  const nowMs = useMemo(() => new Date(nowIso).getTime(), [nowIso]);
  const { ids: saved } = useSaved();
  const { votes } = useVotes();
  const hidden = useMemo(() => Object.keys(votes).filter((id) => votes[id] === -1), [votes]);
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const wide = useIsWide();

  useEffect(() => {
    try {
      const v = localStorage.getItem("gw:view");
      if (v === "table" || v === "cards") setView(v);
      const n = Number(localStorage.getItem("gw:pageSize"));
      if (PAGE_SIZES.includes(n)) setPageSize(n);
    } catch {}
  }, []);
  const changeView = (v: "cards" | "table") => {
    setView(v);
    try { localStorage.setItem("gw:view", v); } catch {}
  };
  const patch = (p: Partial<Filters>) => {
    setF((cur) => ({ ...cur, ...p }));
    setPage(1);
  };
  const changeSort = (s: Sort) => {
    setSort(s);
    setPage(1);
  };
  const changePageSize = (n: number) => {
    setPageSize(n);
    setPage(1);
    try { localStorage.setItem("gw:pageSize", String(n)); } catch {}
  };
  const reset = () => {
    setF(DEFAULT_FILTERS);
    setSort(DEFAULT_SORT);
    setPage(1);
  };
  const goTo = (n: number) => {
    setPage(n);
    document.getElementById("results")?.scrollIntoView({ block: "start" });
  };
  const toggleCat = (id: string) => patch({ cats: f.cats.includes(id) ? f.cats.filter((c) => c !== id) : [...f.cats, id] });
  const clickSort = (key: SortKey) =>
    changeSort(sort.key === key ? { key, dir: sort.dir === "asc" ? "desc" : "asc" } : { key, dir: defaultDir(key) });

  const sources = useMemo(() => [...new Set(articles.map((a) => a.source_name))].sort(), [articles]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    articles.forEach((a) => m.set(a.category, (m.get(a.category) ?? 0) + 1));
    return m;
  }, [articles]);

  const filtered = useMemo(() => applyFilters(articles, f, saved, hidden, nowMs), [articles, f, saved, hidden, nowMs]);
  const items = useMemo(() => applySort(filtered, sort), [filtered, sort]);
  const digest = useMemo(() => pickDigest(articles.filter((a) => !hidden.includes(a.id)), nowMs), [articles, hidden, nowMs]);

  const filtering = isFiltered(f);
  const effView = wide ? view : "cards";
  // Highlights are pulled out of the list on every page, but only drawn on page 1.
  const hasDigest = effView === "cards" && !filtering && sort.key === "date" && sort.dir === "desc" && digest.length > 0;
  const showDigest = hasDigest && page === 1;
  const digestIds = new Set(hasDigest ? digest.map((a) => a.id) : []);
  const feed = items.filter((a) => !digestIds.has(a.id));
  const list = effView === "table" ? items : feed;
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const cur = Math.min(page, pages);
  const visible = list.slice((cur - 1) * pageSize, cur * pageSize);
  const from = list.length ? (cur - 1) * pageSize + 1 : 0;
  const to = Math.min(cur * pageSize, list.length);
  const activeCount = [f.period !== "all", f.source, f.minScore, f.deadlineOnly, f.sensitiveOnly, f.savedOnly, f.hiddenOnly].filter(Boolean).length;

  const todayStr = new Date(nowMs).toISOString().slice(0, 10);
  const upcoming = articles.filter((a) => a.deadline_date && a.deadline_date >= todayStr).length;
  const sortValue = SORT_OPTIONS.findIndex((o) => o.sort.key === sort.key && o.sort.dir === sort.dir);

  return (
    <main>
      <div className="flex flex-col gap-5 pb-6 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[24px] font-semibold leading-tight tracking-[-0.025em] sm:text-[30px] lg:text-[34px]">{greeting}. Here is what changed in Germany.</h1>
          <p className="tnum mt-1.5 text-sm text-muted">
            {today} <span className="px-1.5 text-faint">/</span> {articles.length} stories
            <span className="px-1.5 text-faint">/</span> {upcoming} with upcoming dates
            {lastUpdated && <><span className="px-1.5 text-faint">/</span>Updated {timeAgo(lastUpdated, nowIso)}</>}
          </p>
        </div>
        {!demo && <FetchButton />}
      </div>

      {demo && (
        <p className="mb-5 rounded-lg bg-amber-wash px-4 py-3 text-sm text-amber-ink">Sample content. Connect Supabase and an LLM key to see the real briefing.</p>
      )}

      <div className="z-20 -mx-4 lg:sticky lg:top-0 border-y border-line bg-bg/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <label htmlFor="q" className="sr-only">Search stories</label>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"><IconSearch size={16} /></span>
            <input id="q" type="search" value={f.q} onChange={(e) => patch({ q: e.target.value })} placeholder="Search titles, summaries, German originals… (Blue Card, rent, Kindergeld)" className="h-9 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-[13.5px] placeholder:text-faint focus:border-forest focus:outline-none" />
          </div>
          <label className="sr-only" htmlFor="sort">Sort by</label>
          <select id="sort" className={select} value={sortValue} onChange={(e) => changeSort(SORT_OPTIONS[Number(e.target.value)].sort)}>
            {sortValue === -1 && <option value={-1} disabled>Sorted by column</option>}
            {SORT_OPTIONS.map((o, i) => <option key={o.label} value={i}>{o.label}</option>)}
          </select>
          <div role="group" aria-label="View" className="hidden h-9 md:flex overflow-hidden rounded-lg border border-line bg-surface">
            {([["cards", "Cards", IconGrid], ["table", "Table", IconTable]] as const).map(([v, label, Icon]) => (
              <button key={v} type="button" onClick={() => changeView(v)} aria-pressed={effView === v} className={`inline-flex items-center gap-1.5 px-3 text-[13px] font-medium ${effView === v ? "bg-ink text-white" : "text-muted hover:text-ink"}`}>
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="no-scrollbar -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-0.5">
          <button type="button" onClick={() => patch({ cats: [] })} className={toggleCls(f.cats.length === 0)}>All</button>
          {CATEGORIES.filter((c) => counts.get(c.id)).map((c) => {
            const on = f.cats.includes(c.id);
            return (
              <button key={c.id} type="button" onClick={() => toggleCat(c.id)} aria-pressed={on} className={`${toggleCls(on)} shrink-0 gap-1.5`}>
                <span className="size-2 rounded-[3px]" style={{ background: c.dot }} />
                {c.label}
                <span className={`tnum text-xs ${on ? "text-white/70" : "text-faint"}`}>{counts.get(c.id)}</span>
              </button>
            );
          })}
        </div>

        <button type="button" onClick={() => setFiltersOpen((o) => !o)} aria-expanded={filtersOpen} className="mt-2.5 inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[13px] font-medium text-muted md:hidden">
          Filters{activeCount ? ` (${activeCount})` : ""} <span aria-hidden="true">{filtersOpen ? "▴" : "▾"}</span>
        </button>
        <div className={`${filtersOpen ? "flex" : "hidden"} mt-2.5 flex-wrap items-center gap-2 md:flex`}>
          <label className="sr-only" htmlFor="period">Time period</label>
          <select id="period" className={select} value={f.period} onChange={(e) => patch({ period: e.target.value as Filters["period"] })}>
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <label className="sr-only" htmlFor="source">Source</label>
          <select id="source" className={select} value={f.source} onChange={(e) => patch({ source: e.target.value })}>
            <option value="">All sources</option>
            {sources.map((s) => <option key={s}>{s}</option>)}
          </select>
          <label className="sr-only" htmlFor="rel">Minimum relevance</label>
          <select id="rel" className={select} value={f.minScore} onChange={(e) => patch({ minScore: Number(e.target.value) })}>
            <option value={0}>Any relevance</option>
            <option value={50}>Relevance 50+</option>
            <option value={70}>Relevance 70+</option>
            <option value={85}>Relevance 85+</option>
          </select>
          <button type="button" aria-pressed={f.deadlineOnly} onClick={() => patch({ deadlineOnly: !f.deadlineOnly })} className={toggleCls(f.deadlineOnly)}>Has a date</button>
          <button type="button" aria-pressed={f.sensitiveOnly} onClick={() => patch({ sensitiveOnly: !f.sensitiveOnly })} className={toggleCls(f.sensitiveOnly)}>Time-sensitive</button>
          <button type="button" aria-pressed={f.savedOnly} onClick={() => patch({ savedOnly: !f.savedOnly })} className={toggleCls(f.savedOnly)}>Saved{saved.length ? ` (${saved.length})` : ""}</button>
          {(hidden.length > 0 || f.hiddenOnly) && (
            <button type="button" aria-pressed={f.hiddenOnly} onClick={() => patch({ hiddenOnly: !f.hiddenOnly })} className={toggleCls(f.hiddenOnly)} title="Stories you marked as not useful. Press the thumb again to restore.">Hidden by you ({hidden.length})</button>
          )}
          {(filtering || sort.key !== "date" || sort.dir !== "desc") && (
            <button type="button" onClick={reset} className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-[13px] font-medium text-muted hover:text-ink">
              <IconX size={14} /> Reset
            </button>
          )}
          <label className="ml-auto flex items-center gap-2 text-[13px] text-muted">
            Per page
            <select className={select} value={pageSize} onChange={(e) => changePageSize(Number(e.target.value))}>
              {PAGE_SIZES.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <p className="tnum mt-2.5 text-[13px] text-muted" aria-live="polite">
          {items.length === 0 ? "No stories match" : <>Showing <strong className="font-semibold text-ink">{from}–{to}</strong> of {list.length}{hasDigest && <> (plus {digest.length} in this week's highlights)</>}</>}
          {filtering && <> · {articles.length} stories in total</>}
        </p>
      </div>

      <div id="results" className="mt-6 scroll-mt-4 space-y-8">
        {showDigest && (
          <section aria-labelledby="digest-h" className="rounded-xl border border-forest/15 bg-forest-wash/70 p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4">
              <h2 id="digest-h" className="text-lg font-semibold tracking-[-0.015em] text-forest">
                {digest.length === 1 ? "1 thing this week" : `${digest.length} things this week`} that might affect you
              </h2>
              <p className="text-[13px] text-muted">Highest relevance, dated items first.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {digest.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </section>
        )}

        {items.length === 0 ? (
          <EmptyState
            title={articles.length === 0 ? "Nothing here yet" : "No stories match"}
            body={articles.length === 0 ? "Hit Fetch now to read this morning's German sources for you." : "Try fewer filters or a different search. Nothing urgent is hiding from you."}
            action={filtering && <button type="button" onClick={reset} className="inline-flex h-9 items-center rounded-lg bg-forest px-4 text-sm font-semibold text-white">Clear filters</button>}
          />
        ) : effView === "table" ? (
          <ArticleTable items={visible} sort={sort} onSort={clickSort} />
        ) : (
          <div>
            {showDigest && visible.length > 0 && <h2 className="mb-3 text-sm font-semibold text-muted">Everything else, newest first</h2>}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visible.map((a) => <ArticleCard key={a.id} article={a} />)}
            </div>
          </div>
        )}
        {items.length > 0 && (
          <div className="flex flex-col items-center gap-3 border-t border-line pt-6">
            <Pagination total={list.length} page={cur} pageSize={pageSize} onPage={goTo} />
            <p className="tnum text-[13px] text-muted">{from}–{to} of {list.length} stories</p>
          </div>
        )}
      </div>
    </main>
  );
}
