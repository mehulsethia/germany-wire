import { hasSupabase, supabase } from "./supabase";
import type { Examples } from "./llm";

export const HIDE_AT = 2; // downvotes from different readers before a story disappears for everyone

type Row = { article_id: string; vote: number };

async function allVotes(): Promise<Row[]> {
  if (!hasSupabase()) return [];
  const { data, error } = await supabase().from("feedback").select("article_id, vote");
  return error ? [] : (data as Row[]); // table not created yet -> no feedback
}

/** Story ids that enough readers marked as not useful. */
export async function hiddenIds(): Promise<Set<string>> {
  const down = new Map<string, number>();
  (await allVotes()).forEach((r) => r.vote < 0 && down.set(r.article_id, (down.get(r.article_id) ?? 0) + 1));
  return new Set([...down].filter(([, n]) => n >= HIDE_AT).map(([id]) => id));
}

/** Recent rated headlines, used as examples in the filtering prompt. */
export async function getExamples(): Promise<Examples> {
  const votes = await allVotes();
  if (!votes.length) return { useful: [], notUseful: [] };
  const ids = [...new Set(votes.map((v) => v.article_id))].slice(0, 200);
  const { data } = await supabase().from("articles").select("id, title_en").in("id", ids);
  const title = new Map((data ?? []).map((a) => [a.id as string, a.title_en as string]));
  const pick = (sign: number) =>
    [...new Set(votes.filter((v) => Math.sign(v.vote) === sign).map((v) => title.get(v.article_id)).filter((t): t is string => Boolean(t)))].slice(-8);
  return { useful: pick(1), notUseful: pick(-1) };
}
