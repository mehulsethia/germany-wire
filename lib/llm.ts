import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { CATEGORY_IDS } from "./categories";
import type { RawItem } from "./types";

const Result = z.object({
  title_en: z.string().min(1),
  summary_en: z.string().min(1),
  relevance_score: z.number().min(0).max(100),
  category: z.enum(CATEGORY_IDS),
  is_time_sensitive: z.boolean(),
  deadline_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});
export type LlmResult = z.infer<typeof Result>;

const SYSTEM = `You are the editor of "Germany Wire", a calm daily briefing for Indian and other non-German expats living in Germany (skilled workers on Blue Card / work visas, students, families, people renewing residence permits). You read raw German government and news items and decide what matters to them.

For each item return ONLY a JSON object (no prose, no code fences) with:
- title_en: clear, plain English headline (max ~90 chars). No clickbait.
- summary_en: 2-3 short sentences in warm, plain English. Say what changed and what it means for an expat's daily life or paperwork. Never invent facts that are not in the input. Explain German terms the first time (e.g. "Aufenthaltstitel (residence permit)").
- relevance_score: integer 0-100 = how useful this is to an expat in Germany. 80+ = direct impact on visas, jobs, taxes, benefits, rent or healthcare. 40-79 = useful context. Below 40 = noise (foreign policy, crime, sports, regional politics, celebrity, pure party politics).
- category: exactly one of: ${CATEGORY_IDS.join(", ")}.
- is_time_sensitive: true only if there is a deadline, a rule taking effect on a specific date, or something people must act on soon.
- deadline_date: "YYYY-MM-DD" of that deadline or effective date if the text states one, else null. Never guess a date.`;

let client: Anthropic | null = null;

export async function analyze(item: RawItem): Promise<LlmResult> {
  client ??= new Anthropic();
  const msg = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Source: ${item.sourceName}\nPublished: ${item.publishedAt}\nTitle (German): ${item.title}\nContent (German): ${item.body.slice(0, 3000) || "(none)"}`,
      },
    ],
  });
  const block = msg.content.find((b) => b.type === "text");
  const raw = block && block.type === "text" ? block.text : "";
  const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
  return Result.parse(JSON.parse(json));
}
