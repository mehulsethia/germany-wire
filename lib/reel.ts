import type { Article } from "./types";
import { deadlineParts } from "./dates";

/** Short, punchy, paste-ready script for a reel voiceover or caption. */
export function reelScript(a: Article): string {
  const sentences = a.summary_en
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const hook = a.deadline_date
    ? "Living in Germany? Mark your calendar."
    : "Living in Germany? Quick update.";
  const lines = [`HOOK: ${hook}`, "", `HEADLINE: ${a.title_en}`, "", ...sentences.map((s, i) => `POINT ${i + 1}: ${s}`)];
  if (a.deadline_date) lines.push("", `DATE TO REMEMBER: ${deadlineParts(a.deadline_date).full}`);
  lines.push("", "CTA: Save this for later and follow for more Germany updates.", "", `Source: ${a.source_name}, ${a.source_url}`, "#germany #indiansingermany #expatlife");
  return lines.join("\n");
}
