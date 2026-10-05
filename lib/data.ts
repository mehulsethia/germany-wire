import { hasSupabase, supabase } from "./supabase";
import { SAMPLE_ARTICLES } from "./sample";
import type { Article } from "./types";
import { hiddenIds } from "./feedback";

export const isDemo = () => !hasSupabase();

/** Everything we have, newest first. The explorer filters, sorts and searches it in the browser. */
export async function getArticles(limit = 600): Promise<Article[]> {
  if (isDemo()) return [...SAMPLE_ARTICLES].sort((a, b) => b.published_at.localeCompare(a.published_at));
  const [{ data, error }, hidden] = await Promise.all([
    supabase().from("articles").select("*").order("published_at", { ascending: false }).limit(limit),
    hiddenIds(),
  ]);
  if (error) throw error;
  return (data as Article[]).filter((a) => !hidden.has(a.id));
}

export async function getByIds(ids: string[]): Promise<Article[]> {
  if (!ids.length) return [];
  if (isDemo()) return SAMPLE_ARTICLES.filter((a) => ids.includes(a.id));
  const { data, error } = await supabase().from("articles").select("*").in("id", ids.slice(0, 100));
  if (error) throw error;
  return (data as Article[]).sort((a, b) => b.published_at.localeCompare(a.published_at));
}
