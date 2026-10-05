import { analyze } from "./llm";
import { supabase } from "./supabase";
import { SOURCES } from "./sources";
import type { RawItem } from "./types";

export async function runIngest() {
  const threshold = Number(process.env.RELEVANCE_THRESHOLD ?? 40);
  const cap = Number(process.env.MAX_NEW_PER_RUN ?? 60);
  const report: Record<string, unknown> = { sources: {}, stored: 0, discarded: 0, failed: 0 };

  // 1. fetch every source; one failing source must not sink the run
  const all: RawItem[] = [];
  await Promise.all(
    SOURCES.map(async ([name, fn]) => {
      try {
        const items = await fn();
        (report.sources as Record<string, unknown>)[name] = items.length;
        all.push(...items);
      } catch (e) {
        (report.sources as Record<string, unknown>)[name] = `error: ${(e as Error).message}`;
      }
    }),
  );

  // 2. dedupe by URL, within batch and against the DB (before spending LLM tokens)
  const unique = [...new Map(all.map((i) => [i.url, i])).values()];
  const { data: existing, error } = await supabase()
    .from("articles")
    .select("source_url")
    .in("source_url", unique.map((i) => i.url));
  if (error) throw error;
  const seen = new Set((existing ?? []).map((r) => r.source_url));
  const fresh = unique
    .filter((i) => !seen.has(i.url))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .slice(0, cap);
  report.new = fresh.length;

  // 3. LLM filter + translate, small concurrency
  const rows: Record<string, unknown>[] = [];
  for (let i = 0; i < fresh.length; i += 3) {
    await Promise.all(
      fresh.slice(i, i + 3).map(async (item) => {
        try {
          const r = await analyze(item);
          if (r.relevance_score < threshold) {
            report.discarded = (report.discarded as number) + 1;
            return;
          }
          rows.push({
            source_name: item.sourceName,
            source_url: item.url,
            title_de: item.title,
            title_en: r.title_en,
            summary_en: r.summary_en,
            category: r.category,
            relevance_score: Math.round(r.relevance_score),
            published_at: item.publishedAt,
            is_time_sensitive: r.is_time_sensitive,
            deadline_date: r.deadline_date,
          });
        } catch {
          report.failed = (report.failed as number) + 1;
        }
      }),
    );
  }

  // 4. store (upsert on source_url = safe if two runs overlap)
  if (rows.length) {
    const { error: insErr } = await supabase()
      .from("articles")
      .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true });
    if (insErr) throw insErr;
  }
  report.stored = rows.length;
  return report;
}
