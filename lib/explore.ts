import type { Article } from "./types";
import { getCategory } from "./categories";

export type SortKey = "date" | "relevance" | "deadline" | "title" | "category" | "source";
export type Sort = { key: SortKey; dir: "asc" | "desc" };
export type Filters = {
  q: string;
  cats: string[];
  source: string;
  period: "7" | "30" | "all";
  minScore: number;
  deadlineOnly: boolean;
  sensitiveOnly: boolean;
  savedOnly: boolean;
};

export const DEFAULT_FILTERS: Filters = {
  q: "", cats: [], source: "", period: "all", minScore: 0,
  deadlineOnly: false, sensitiveOnly: false, savedOnly: false,
};
export const DEFAULT_SORT: Sort = { key: "date", dir: "desc" };

export const SORT_OPTIONS: { label: string; sort: Sort }[] = [
  { label: "Newest first", sort: { key: "date", dir: "desc" } },
  { label: "Oldest first", sort: { key: "date", dir: "asc" } },
  { label: "Most relevant", sort: { key: "relevance", dir: "desc" } },
  { label: "Deadline: soonest", sort: { key: "deadline", dir: "asc" } },
  { label: "Category A to Z", sort: { key: "category", dir: "asc" } },
  { label: "Source A to Z", sort: { key: "source", dir: "asc" } },
  { label: "Title A to Z", sort: { key: "title", dir: "asc" } },
];

export const defaultDir = (k: SortKey): Sort["dir"] => (k === "date" || k === "relevance" ? "desc" : "asc");

export const isFiltered = (f: Filters) =>
  JSON.stringify(f) !== JSON.stringify(DEFAULT_FILTERS);

const day = (iso: string) => new Date(`${iso}T00:00:00Z`).getTime();

export function applyFilters(list: Article[], f: Filters, saved: string[], nowMs: number): Article[] {
  const terms = f.q.toLowerCase().split(/\s+/).filter(Boolean);
  const cutoff = f.period === "all" ? 0 : nowMs - Number(f.period) * 864e5;
  return list.filter((a) => {
    if (f.cats.length && !f.cats.includes(a.category)) return false;
    if (f.source && a.source_name !== f.source) return false;
    if (a.relevance_score < f.minScore) return false;
    if (f.deadlineOnly && !a.deadline_date) return false;
    if (f.sensitiveOnly && !a.is_time_sensitive) return false;
    if (f.savedOnly && !saved.includes(a.id)) return false;
    if (cutoff && new Date(a.published_at).getTime() < cutoff) return false;
    if (terms.length) {
      const hay = `${a.title_en} ${a.summary_en} ${a.title_de} ${a.source_name} ${getCategory(a.category).label}`.toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  });
}

export function applySort(list: Article[], { key, dir }: Sort): Article[] {
  const m = dir === "asc" ? 1 : -1;
  const cmp: Record<SortKey, (a: Article, b: Article) => number> = {
    date: (a, b) => a.published_at.localeCompare(b.published_at),
    relevance: (a, b) => a.relevance_score - b.relevance_score,
    deadline: (a, b) => 0, // handled below (nulls last)
    title: (a, b) => a.title_en.localeCompare(b.title_en),
    category: (a, b) => getCategory(a.category).label.localeCompare(getCategory(b.category).label),
    source: (a, b) => a.source_name.localeCompare(b.source_name),
  };
  return [...list].sort((a, b) => {
    if (key === "deadline") {
      if (!a.deadline_date && !b.deadline_date) return 0;
      if (!a.deadline_date) return 1;
      if (!b.deadline_date) return -1;
      return m * (day(a.deadline_date) - day(b.deadline_date));
    }
    return m * cmp[key](a, b) || b.published_at.localeCompare(a.published_at);
  });
}

/** This week's top items: only solidly relevant ones, dated or time-sensitive first. */
export function pickDigest(list: Article[], nowMs: number, max = 3): Article[] {
  const since = nowMs - 7 * 864e5;
  const today = new Date(nowMs).toISOString().slice(0, 10);
  const urgent = (a: Article) => Boolean(a.deadline_date && a.deadline_date >= today) || a.is_time_sensitive;
  return list
    .filter((a) => new Date(a.published_at).getTime() >= since && a.relevance_score >= 60)
    .sort((a, b) => Number(urgent(b)) - Number(urgent(a)) || b.relevance_score - a.relevance_score)
    .slice(0, max);
}
