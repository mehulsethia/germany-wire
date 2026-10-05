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

const SYSTEM = `You are the strict editor of "Germany Wire", a short daily briefing for Indians and other non-German expats living in Germany (skilled workers on Blue Card or work visas, students, families, people renewing residence permits). Your main job is to REJECT noise. Readers are busy and anxious about German admin; a boring feed makes them leave.

Judge each German item with one question: "Would an Indian expat living in Germany actually need to know this, or change something they do?"

Score high (70-100) when it directly changes: visas, residence permits, Blue Card, Chancenkarte, citizenship, work permits, recognition of foreign degrees, employer or job-market rules, income tax, social security, pension, minimum wage, health insurance, Kindergeld/parental benefits, Bürgergeld, rent, Wohngeld, energy or grocery costs, Deutschlandticket or transport costs, bank, Schufa or ID rules, and anything with a deadline or effective date.
Score medium (40-69) for credible context that shapes expat life: big economic or labour-market news, new bills that are likely to pass, consumer-price measures (fuel, energy, food), housing benefit or rent plans, integration and language-course funding, migration statistics and policy, pension and health-insurance debates, major strikes affecting travel, housing market trends.
Score low (0-39) for: foreign policy and wars, military, crime and court cases, accidents, regional or local politics, party and election drama, parliamentary procedure with no practical effect, sports, culture, celebrity, weather, and anything that only matters to German citizens or to a niche industry. When unsure, score low.

Return ONLY a JSON object (no prose, no code fences) with:
- title_en: clear, plain English headline (max ~90 chars). No clickbait.
- summary_en: 2-3 short, warm sentences in plain English. Say what changed and what it means for an expat's life or paperwork. Never invent facts that are not in the input; if the input is thin, say less. Explain German terms the first time (e.g. "Aufenthaltstitel (residence permit)").
- relevance_score: integer 0-100 per the rubric above.
- category: exactly one of: ${CATEGORY_IDS.join(", ")}. Use "other" only for important Germany news that fits nowhere else.
- is_time_sensitive: true only if there is a deadline, a rule taking effect on a specific date, or something people must act on soon.
- deadline_date: "YYYY-MM-DD" of that deadline or effective date if the text states one, else null. Never guess a date.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function viaOpenAI(user: string): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: user },
        ],
      }),
    });
    if ((res.status === 429 || res.status >= 500) && attempt < 3) {
      await sleep(3000 * 2 ** attempt);
      continue;
    }
    if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()).choices?.[0]?.message?.content ?? "";
  }
}

let anthropic: Anthropic | null = null;
async function viaClaude(user: string): Promise<string> {
  anthropic ??= new Anthropic({ maxRetries: 3 });
  const msg = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
    max_tokens: 700,
    system: SYSTEM,
    messages: [{ role: "user", content: user }],
  });
  const block = msg.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

/** Configured providers, used turn by turn so neither key is overused. */
function providers() {
  const list: ((user: string) => Promise<string>)[] = [];
  if (process.env.OPENAI_API_KEY) list.push(viaOpenAI);
  if (process.env.ANTHROPIC_API_KEY) list.push(viaClaude);
  return list;
}

export const llmConfigured = () => providers().length > 0;

let turn = 0;

export async function analyze(item: RawItem): Promise<LlmResult> {
  const user = `Source: ${item.sourceName}\nPublished: ${item.publishedAt}\nTitle (German): ${item.title}\nContent (German): ${item.body.slice(0, 3000) || "(none)"}`;
  const list = providers();
  const start = turn++;
  let lastErr: unknown;
  // next provider's turn first; if it errors, the other one covers
  for (let i = 0; i < list.length; i++) {
    try {
      const raw = await list[(start + i) % list.length](user);
      const json = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
      return Result.parse(JSON.parse(json));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
