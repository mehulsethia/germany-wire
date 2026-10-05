import type { RawItem } from "./types";

// Topics that always matter to expats. A hit lifts a borderline score so it is not lost to model noise;
// the item still has to carry a concrete "why it matters" to be kept.
const MUST_KEEP = [
  "blaue karte", "blue card", "chancenkarte", "opportunity card", "aufenthaltstitel", "aufenthaltserlaubnis",
  "niederlassungserlaubnis", "einbürgerung", "staatsangehörigkeit", "fachkräfteeinwanderung", "fachkräfte",
  "visum", "visa ", "ausländerbehörde", "anerkennung ausländischer", "berufsanerkennung", "familiennachzug",
  "studierendenvisum", "mindestlohn", "kindergeld", "elterngeld", "bürgergeld", "wohngeld", "deutschlandticket",
  "krankenversicherung", "einkommensteuer", "steuerklasse", "steuererklärung", "rentenversicherung",
  "integrationskurs", "indien", "india",
];

export const MUST_KEEP_FLOOR = 55;

export function mustKeep(item: Pick<RawItem, "title" | "body">): boolean {
  const hay = `${item.title} ${item.body}`.toLowerCase();
  return MUST_KEEP.some((k) => hay.includes(k));
}
