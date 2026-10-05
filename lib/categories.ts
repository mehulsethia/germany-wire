export const CATEGORIES = [
  { id: "immigration", label: "Immigration", dot: "#5b7f95", bg: "#e4edf1", fg: "#2f4d5f" },
  { id: "new-laws", label: "New laws & reforms", dot: "#7a6a9a", bg: "#ebe7f2", fg: "#4a3f66" },
  { id: "jobs", label: "Jobs", dot: "#5f8a6b", bg: "#e3eee6", fg: "#2f5a3c" },
  { id: "taxes", label: "Taxes", dot: "#a07a4f", bg: "#f1e9dd", fg: "#6a4c27" },
  { id: "money", label: "Money", dot: "#4f8a82", bg: "#dfeeeb", fg: "#27564f" },
  { id: "healthcare", label: "Healthcare", dot: "#b0697a", bg: "#f3e4e8", fg: "#6e3446" },
  { id: "social-benefits", label: "Social benefits", dot: "#8a8f4f", bg: "#eceedb", fg: "#555a26" },
  { id: "housing", label: "Housing & cost of living", dot: "#b07a5a", bg: "#f3e6dd", fg: "#6e4630" },
  { id: "family", label: "Family", dot: "#a8708f", bg: "#f2e5ed", fg: "#6b3e58" },
  { id: "transport", label: "Transport", dot: "#6a86a8", bg: "#e4eaf2", fg: "#33496a" },
  { id: "other", label: "Other", dot: "#8b9097", bg: "#eceeef", fg: "#464b52" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS = CATEGORIES.map((c) => c.id) as unknown as [CategoryId, ...CategoryId[]];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
