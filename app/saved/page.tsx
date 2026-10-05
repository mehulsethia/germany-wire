"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { useSaved } from "@/lib/useSaved";
import type { Article } from "@/lib/types";

export default function SavedPage() {
  const { ids } = useSaved();
  const [articles, setArticles] = useState<Article[] | null>(null);
  const key = ids.join(",");

  useEffect(() => {
    if (!key) {
      setArticles([]);
      return;
    }
    let live = true;
    fetch("/api/articles", { method: "POST", body: JSON.stringify({ ids: key.split(",") }) })
      .then((r) => r.json())
      .then((d) => live && setArticles(d.articles))
      .catch(() => live && setArticles([]));
    return () => { live = false; };
  }, [key]);

  return (
    <main>
      <h1 className="text-[28px] font-semibold tracking-[-0.025em] sm:text-[34px]">Saved for later</h1>
      <p className="mb-6 mt-1.5 text-sm text-muted">Keep the rules you will need at the Ausländerbehörde, the Finanzamt or your next visa appointment.</p>
      {articles === null ? (
        <p role="status" className="text-sm text-muted">Opening your saved items…</p>
      ) : articles.length === 0 ? (
        <EmptyState title="Nothing saved yet" body="Tap Save on any story and it will wait for you here." action={<Link href="/" className="inline-flex h-9 items-center rounded-lg bg-forest px-4 text-sm font-semibold text-white">Back to the briefing</Link>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {articles.filter((a) => ids.includes(a.id)).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </main>
  );
}
