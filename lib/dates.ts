const fmt = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", ...opts });

export const shortDate = (iso: string) => fmt({ day: "numeric", month: "short" }).format(new Date(iso));
export const longDate = (iso: string) => fmt({ day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));

/** deadline_date is "YYYY-MM-DD"; parse as UTC midnight so it never shifts a day. */
export function deadlineParts(date: string) {
  const d = new Date(`${date}T00:00:00Z`);
  const month = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" }).format(d);
  const day = d.getUTCDate();
  const full = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(d);
  const today = new Date();
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((d.getTime() - todayUtc) / 864e5);
  const relative =
    days < 0 ? "already passed" : days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`;
  return { month, day, full, days, relative };
}

export function timeAgo(iso: string, nowIso: string) {
  const mins = Math.max(0, Math.round((new Date(nowIso).getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}
