import type { Article } from "@/lib/types";
import ArticleCard from "./ArticleCard";

export default function Digest({ items }: { items: Article[] }) {
  if (!items.length) return null;
  const n = items.length;
  return (
    <section aria-labelledby="digest-h" className="rounded-[2rem] bg-sage-wash p-3 sm:p-4">
      <div className="px-3 pb-4 pt-4 sm:px-4">
        <h2 id="digest-h" className="font-serif text-[1.65rem] font-semibold leading-tight tracking-tight text-sage-deep sm:text-3xl">
          {n === 1 ? "1 new thing this week" : `${n} new things this week`} that might affect you
        </h2>
        <p className="mt-1.5 text-[0.95rem] text-ink-soft">The rest can wait. Dates come first.</p>
      </div>
      <div className="flex flex-col gap-3">
        {items.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  );
}
