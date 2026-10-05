import type { RawItem } from "../types";
import { fetchTagesschau } from "./tagesschau";
import { fetchDip } from "./dip";
import { fetchRss } from "./rss";

const BT = "https://www.bundestag.de/static/appdata/includes/rss";
const BR = "https://www.bundesrat.de/SiteGlobals/Functions/RSSFeed";

// Bundestag topic feeds that can touch an expat's life. Overlaps are deduped by URL.
const BUNDESTAG_FEEDS = ["aktuellethemen", "pressemitteilungen", "inneres", "arbeitsoziales", "finanzen", "gesundheit", "familie", "bauwohnenstadtentwicklungkommunen", "verkehr", "wirtschaft", "bildung", "recht"];

async function bundestag(): Promise<RawItem[]> {
  const results = await Promise.allSettled(
    BUNDESTAG_FEEDS.map((f) => fetchRss("Bundestag", `${BT}/${f}.rss`, { limit: 10 })),
  );
  const ok = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
  if (!ok.length) throw new Error("all Bundestag feeds failed");
  return ok;
}

/** All free sources. Each one is isolated, so one outage never blocks the run. */
export const SOURCES: [name: string, fetch: () => Promise<RawItem[]>][] = [
  ["tagesschau", fetchTagesschau],
  ["bundesregierung", () => fetchRss("Bundesregierung", process.env.BREG_RSS_URL ?? "https://www.bundesregierung.de/service/rss/breg-de/1151242/feed.xml")],
  ["bamf", () => fetchRss("BAMF", process.env.BAMF_RSS_URL ?? "https://www.BAMF.de/SiteGlobals/Functions/RSS/DE/Feed/RSSNewsfeed_Pressemitteilungen.xml")],
  ["bundestag", bundestag],
  ["bundestag-dip", fetchDip],
  ["bundesrat", () => fetchRss("Bundesrat", `${BR}/RSSGenerator_top_plenumkompakt.xml`, { limit: 15 })],
  ["gesetze-im-internet", () => fetchRss("Gesetze im Internet", "https://www.gesetze-im-internet.de/aktuDienst-rss-feed.xml", { limit: 20, titleFromDescription: true })],
];
