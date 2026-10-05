import { hasSupabase, supabase } from "./supabase";
import { SAMPLE_ARTICLES } from "./sample";
import type { Article } from "./types";

export const isDemo = () => !hasSupabase();

const clean = (q: string) => q.replace(/[,()%*_\\]/g, " ").trim().slice(0, 80);

export async function getArticles(opts: { category?: string; q?: string; limit?: number } = {}): Promise<Article[]> {
  const { category, q, limit = 60 } = opts;
  if (isDemo()) {
    const needle = q?.toLowerCase();
    return SAMPLE_ARTICLES.filter(
      (a) =>
        (!category || a.category === category) &&
        (!needle || [a.title_en, a.summary_en, a.title_de].some((t) => t.toLowerCase().includes(needle))),
    ).sort((a, b) => b.published_at.localeCompare(a.published_at));
  }
  let query = supabase().from("articles").select("*").order("published_at", { ascending: false }).limit(limit);
  if (category) query = query.eq("category", category);
  const term = q && clean(q);
  if (term) query = query.or(`title_en.ilike.%${term}%,summary_en.ilike.%${term}%,title_de.ilike.%${term}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data as Article[];
}

/** This week's top items: time-sensitive first, then by relevance. */
export async function getDigest(max = 3): Promise<Article[]> {
  const since = Date.now() - 7 * 864e5;
  const recent = (await getArticles({ limit: 100 })).filter((a) => new Date(a.published_at).getTime() >= since);
  return recent
    .sort((a, b) => Number(b.is_time_sensitive) - Number(a.is_time_sensitive) || b.relevance_score - a.relevance_score)
    .slice(0, max);
}

export async function getByIds(ids: string[]): Promise<Article[]> {
  if (!ids.length) return [];
  if (isDemo()) return SAMPLE_ARTICLES.filter((a) => ids.includes(a.id));
  const { data, error } = await supabase().from("articles").select("*").in("id", ids.slice(0, 100));
  if (error) throw error;
  return (data as Article[]).sort((a, b) => b.published_at.localeCompare(a.published_at));
}
