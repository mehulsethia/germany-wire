import { getArticles, isDemo } from "@/lib/data";
import { lastUpdated } from "@/lib/runs";
import Explorer from "@/components/Explorer";

export const dynamic = "force-dynamic";

export default async function Home() {
  const demo = isDemo();
  const now = new Date();
  const hour = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(now));
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(now);
  const [articles, updated] = await Promise.all([getArticles(), demo ? null : lastUpdated()]);
  return <Explorer articles={articles} nowIso={now.toISOString()} lastUpdated={updated} greeting={greeting} today={today} demo={demo} />;
}
