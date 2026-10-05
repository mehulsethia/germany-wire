"use client";
import { useEffect, useState } from "react";
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
    return () => {
      live = false;
    };
  }, [key]);

  return (
    <main>
      <h1 className="mb-1 font-serif text-4xl font-semibold tracking-tight">Saved for later</h1>
      <p className="mb-6 text-lg text-ink-soft">The rules you will need when you are actually at the Ausländerbehörde.</p>
      {articles === null ? (
        <p role="status" className="breathe font-serif text-xl text-sage-deep">Opening your saved items…</p>
      ) : articles.length === 0 ? (
        <EmptyState saved />
      ) : (
        <div className="flex flex-col gap-4">
          {articles.filter((a) => ids.includes(a.id)).map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      )}
    </main>
  );
}
