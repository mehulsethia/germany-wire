import { analyze, type Examples, type LlmResult } from "./llm";
import { MUST_KEEP_FLOOR, mustKeep } from "./keywords";
import type { RawItem } from "./types";

export const threshold = () => Number(process.env.RELEVANCE_THRESHOLD ?? 50);

export type Verdict = { keep: boolean; score: number; reason: string; result: LlmResult };

/**
 * The one place that decides keep vs drop:
 *  - no concrete "why it matters" -> drop
 *  - must-keep topic (Blue Card, Kindergeld, ...) -> score floored so model noise cannot lose it
 *  - otherwise the score must reach the threshold
 */
export async function judge(item: RawItem, ex?: Examples): Promise<Verdict> {
  const result = await analyze(item, ex);
  const why = result.why_it_matters?.trim();
  let score = Math.round(result.relevance_score);
  if (!why) return { keep: false, score, reason: "no concrete reason it matters", result };
  if (mustKeep(item)) score = Math.max(score, MUST_KEEP_FLOOR);
  return score >= threshold()
    ? { keep: true, score, reason: "ok", result }
    : { keep: false, score, reason: `score ${score} < ${threshold()}`, result };
}
