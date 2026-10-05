export const CATEGORIES = [
  { id: "immigration", label: "Immigration", dot: "#2f6f8f", fg: "#1f4f68" },
  { id: "new-laws", label: "New laws & reforms", dot: "#6d58a8", fg: "#47377a" },
  { id: "jobs", label: "Jobs", dot: "#2e8b57", fg: "#1c5f3a" },
  { id: "taxes", label: "Taxes", dot: "#a0701f", fg: "#6b4a12" },
  { id: "money", label: "Money", dot: "#1f8a7d", fg: "#115a51" },
  { id: "healthcare", label: "Healthcare", dot: "#c04a6a", fg: "#862f48" },
  { id: "social-benefits", label: "Social benefits", dot: "#7f8a22", fg: "#545c12" },
  { id: "housing", label: "Housing & cost of living", dot: "#c0602e", fg: "#86401a" },
  { id: "family", label: "Family", dot: "#b24d93", fg: "#7b3265" },
  { id: "transport", label: "Transport", dot: "#3f6fc0", fg: "#274a8a" },
  { id: "other", label: "Other important news", dot: "#7b8590", fg: "#4a525a" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as unknown as [CategoryId, ...CategoryId[]];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
