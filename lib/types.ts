import type { CategoryId } from "./categories";

export type Article = {
  id: string;
  source_name: string;
  source_url: string;
  title_de: string;
  title_en: string;
  summary_en: string;
  why_it_matters?: string | null;
  category: CategoryId;
  relevance_score: number;
  published_at: string;
  fetched_at: string;
  is_time_sensitive: boolean;
  deadline_date: string | null;
};

/** Raw item from any source, before the LLM sees it. */
export type RawItem = {
  sourceName: string;
  url: string;
  title: string;
  body: string;
  publishedAt: string;
};
