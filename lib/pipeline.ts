import { judge } from "./judge";
import { getExamples } from "./feedback";
import { supabase } from "./supabase";
import { SOURCES } from "./sources";
import type { RawItem } from "./types";

export async function runIngest() {
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
  // Previously rejected URLs. If the table is not created yet, just skip this check.
  const { data: rej } = await supabase()
    .from("rejected_urls")
    .select("source_url")
    .in("source_url", unique.map((i) => i.url));
  (rej ?? []).forEach((r) => seen.add(r.source_url));
  const unseen = unique
    .filter((i) => !seen.has(i.url))
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const fresh = unseen.slice(0, cap);
  report.new = fresh.length;
  report.remaining = unseen.length - fresh.length; // still waiting for the next run

  // 3. LLM filter + translate, small concurrency. Reader feedback steers the model.
  const examples = await getExamples();
  const rows: Record<string, unknown>[] = [];
  const rejected: { source_url: string; relevance_score: number }[] = [];
  for (let i = 0; i < fresh.length; i += 3) {
    await Promise.all(
      fresh.slice(i, i + 3).map(async (item) => {
        try {
          const v = await judge(item, examples);
          if (!v.keep) {
            report.discarded = (report.discarded as number) + 1;
            rejected.push({ source_url: item.url, relevance_score: v.score });
            return;
          }
          const r = v.result;
          rows.push({
            source_name: item.sourceName,
            source_url: item.url,
            title_de: item.title,
            title_en: r.title_en,
            summary_en: r.summary_en,
            why_it_matters: r.why_it_matters,
            category: r.category,
            relevance_score: v.score,
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
    let { error: insErr } = await supabase()
      .from("articles")
      .upsert(rows, { onConflict: "source_url", ignoreDuplicates: true });
    if (insErr?.message.includes("why_it_matters")) {
      // column not added yet: store without it rather than losing the run
      const slim = rows.map(({ why_it_matters: _w, ...rest }) => rest);
      ({ error: insErr } = await supabase().from("articles").upsert(slim, { onConflict: "source_url", ignoreDuplicates: true }));
    }
    if (insErr) throw insErr;
  }
  if (rejected.length) await supabase().from("rejected_urls").upsert(rejected, { onConflict: "source_url", ignoreDuplicates: true });
  report.stored = rows.length;
  return report;
}
