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

export async function fetchRss(sourceName: string, feedUrl: string): Promise<RawItem[]> {
  const res = await fetch(feedUrl, { cache: "no-store", headers: { "User-Agent": "GermanyWire/1.0" } });
  if (!res.ok) throw new Error(`${sourceName} ${res.status}`);
  const xml = parser.parse(await res.text());
  const raw = xml?.rss?.channel?.item ?? [];
  const items = Array.isArray(raw) ? raw : [raw];
  return items
    .filter((i) => i?.title && i?.link)
    .map((i) => {
      const d = i.pubDate ? new Date(i.pubDate) : new Date();
      return {
        sourceName,
        url: text(i.link),
        title: text(i.title),
        body: text(i.description),
        publishedAt: (isNaN(d.getTime()) ? new Date() : d).toISOString(),
      };
    });
}

export const fetchBamf = () =>
  fetchRss(
    "BAMF",
    process.env.BAMF_RSS_URL ?? "https://www.BAMF.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Pressemitteilungen.xml",
  );

export const fetchBundesregierung = () =>
  fetchRss(
    "Bundesregierung",
    process.env.BREG_RSS_URL ?? "https://www.bundesregierung.de/service/rss/breg-de/1151242/feed.xml",
  );
