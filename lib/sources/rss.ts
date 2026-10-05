import { XMLParser } from "fast-xml-parser";
import type { RawItem } from "../types";

const parser = new XMLParser({ ignoreAttributes: true, processEntities: true });

const text = (v: unknown) =>
  (typeof v === "string" ? v : typeof v === "number" ? String(v) : "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function fetchRss(sourceName: string, feedUrl: string, opts: { limit?: number; titleFromDescription?: boolean } = {}): Promise<RawItem[]> {
  const res = await fetch(feedUrl, { cache: "no-store", headers: { "User-Agent": "GermanyWire/1.0" } });
  if (!res.ok) throw new Error(`${sourceName} ${res.status}`);
  const xml = parser.parse(await res.text());
  const raw = xml?.rss?.channel?.item ?? [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .filter((i) => i?.title && i?.link)
    .slice(0, opts.limit ?? 25)
    .map((i) => {
      const d = i.pubDate ? new Date(i.pubDate) : new Date();
      return {
        sourceName,
        url: text(i.link),
        // Gesetze im Internet titles are just "BGBl. 2026 I Nr. 285"; the law's name is in the description.
        title: opts.titleFromDescription ? text(i.description) : text(i.title),
        body: opts.titleFromDescription ? `${text(i.title)}. Neu im Bundesgesetzblatt verkündet.` : text(i.description),
        publishedAt: (isNaN(d.getTime()) ? new Date() : d).toISOString(),
      };
    });
}

