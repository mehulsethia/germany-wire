import { getArticles, getDigest, isDemo } from "@/lib/data";
import Digest from "@/components/Digest";
import ArticleCard from "@/components/ArticleCard";
import CategoryBar from "@/components/CategoryBar";
import SearchBox from "@/components/SearchBox";
import EmptyState from "@/components/EmptyState";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-dynamic";

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  const category = CATEGORIES.some((c) => c.id === one(sp.category)) ? one(sp.category) : undefined;
  const q = one(sp.q)?.slice(0, 80);
  const browsing = Boolean(category || q);

  const [articles, digest] = await Promise.all([getArticles({ category, q }), browsing ? [] : getDigest()]);
  const digestIds = new Set(digest.map((a) => a.id));
  const feed = browsing ? articles : articles.filter((a) => !digestIds.has(a.id));
  const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Berlin" }).format(new Date());

  return (
    <main>
      <div className="mb-6">
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight text-ink sm:text-5xl">{greeting()}.</h1>
        <p className="mt-1 text-lg text-ink-soft">It is {today}. We read the German so you do not have to.</p>
      </div>

      {isDemo() && (
        <p className="mb-5 rounded-2xl bg-amber-wash px-4 py-3 text-sm leading-relaxed text-amber-ink">
          You are looking at sample content. Connect Supabase and Claude to see the real briefing.
        </p>
      )}

      <SearchBox q={q} category={category} />
      <CategoryBar active={category} q={q} />

      <div className="mt-3 flex flex-col gap-4">
        {!browsing && <Digest items={digest} />}
        {!browsing && feed.length > 0 && digest.length > 0 && (
          <h2 className="mt-4 px-1 font-serif text-xl font-semibold text-sage-deep">Everything else, newest first</h2>
        )}
        {feed.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
        {!feed.length && !digest.length && <EmptyState filtered={browsing} />}
      </div>
    </main>
  );
}
