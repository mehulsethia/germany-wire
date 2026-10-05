import type { RawItem } from "../types";

type TsItem = {
  title?: string;
  topline?: string;
  firstSentence?: string;
  date?: string;
  shareURL?: string;
  detailsweb?: string;
  type?: string;
};

export async function fetchTagesschau(): Promise<RawItem[]> {
  const res = await fetch("https://www.tagesschau.de/api2u/news/?pageSize=40", { cache: "no-store" });
  if (!res.ok) throw new Error(`tagesschau ${res.status}`);
  const json = (await res.json()) as { news?: TsItem[] };
  return (json.news ?? [])
    .filter((n) => n.title && (n.shareURL || n.detailsweb) && n.type !== "video")
    .map((n) => ({
      sourceName: "Tagesschau",
      url: (n.shareURL || n.detailsweb)!,
      title: n.title!,
      body: [n.topline, n.firstSentence].filter(Boolean).join(". "),
      publishedAt: n.date ?? new Date().toISOString(),
    }))
    .slice(0, 40);
}
