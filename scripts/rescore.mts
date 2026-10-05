// Re-judge stories already in the database with the current rules.
//   npx tsx scripts/rescore.mts           dry run: prints what would change, writes nothing
//   npx tsx scripts/rescore.mts --apply   adds "why it matters", updates scores, removes stories that no longer pass
import { supabase } from "../lib/supabase.ts";
import { judge } from "../lib/judge.ts";
import { getExamples } from "../lib/feedback.ts";
import type { Article } from "../lib/types.ts";

const apply = process.argv.includes("--apply");
const { data, error } = await supabase().from("articles").select("*").order("published_at", { ascending: false });
if (error) throw error;
const articles = data as Article[];
const examples = await getExamples();

type Out = { a: Article; keep: boolean; score: number; why: string | null; reason: string };
const out: Out[] = [];
for (let i = 0; i < articles.length; i += 3) {
  await Promise.all(
    articles.slice(i, i + 3).map(async (a) => {
      try {
        const v = await judge({ sourceName: a.source_name, url: a.source_url, title: a.title_de, body: a.summary_en, publishedAt: a.published_at }, examples);
        out.push({ a, keep: v.keep, score: v.score, why: v.result.why_it_matters, reason: v.reason });
      } catch (e) {
        console.log("ERR", a.title_en.slice(0, 50), (e as Error).message.slice(0, 80));
      }
    }),
  );
}

out.sort((x, y) => Number(x.keep) - Number(y.keep) || y.score - x.score);
for (const o of out) console.log(`${o.keep ? "KEEP" : "DROP"} ${String(o.a.relevance_score).padStart(3)} -> ${String(o.score).padStart(3)} | ${o.a.source_name.padEnd(15)} | ${o.a.title_en.slice(0, 70)}${o.keep ? "" : `  [${o.reason}]`}`);
console.log(`\n${out.filter((o) => o.keep).length} keep, ${out.filter((o) => !o.keep).length} drop (of ${articles.length})`);

if (apply) {
  for (const o of out) {
    if (o.keep) await supabase().from("articles").update({ relevance_score: o.score, why_it_matters: o.why }).eq("id", o.a.id);
    else {
      await supabase().from("rejected_urls").upsert({ source_url: o.a.source_url, relevance_score: o.score }, { onConflict: "source_url" });
      await supabase().from("articles").delete().eq("id", o.a.id);
    }
  }
  console.log("applied.");
}
