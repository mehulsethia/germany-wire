import type { RawItem } from "../types";

type DipDoc = {
  id: string;
  titel?: string;
  abstract?: string;
  datum?: string;
  vorgangstyp?: string;
  beratungsstand?: string;
  sachgebiet?: string[];
};

/** Bundestag DIP: recent legislative procedures (Gesetzgebung). Needs DIP_API_KEY. */
export async function fetchDip(): Promise<RawItem[]> {
  const key = process.env.DIP_API_KEY;
  if (!key) return [];
  const since = new Date(Date.now() - 21 * 864e5).toISOString().slice(0, 10);
  const url =
    `https://search.dip.bundestag.de/api/v1/vorgang?format=json` +
    `&f.vorgangstyp=Gesetzgebung&f.aktualisiert.start=${since}T00:00:00`;
  const res = await fetch(url, { headers: { Authorization: `ApiKey ${key}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`dip ${res.status}`);
  const json = (await res.json()) as { documents?: DipDoc[] };
  return (json.documents ?? [])
    .filter((d) => d.titel)
    .map((d) => ({
      sourceName: "Bundestag DIP",
      url: `https://dip.bundestag.de/vorgang/${d.id}`,
      title: d.titel!,
      body: [d.beratungsstand && `Stand: ${d.beratungsstand}`, d.sachgebiet?.join(", "), d.abstract]
        .filter(Boolean)
        .join(". "),
      publishedAt: d.datum ? new Date(d.datum).toISOString() : new Date().toISOString(),
    }));
}
