import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function CategoryBar({ active, q }: { active?: string; q?: string }) {
  const href = (cat?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("category", cat);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const pill = (on: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
      on ? "border-sage-deep bg-sage-deep text-paper" : "border-line bg-paper text-ink-soft hover:border-sage"
    }`;
  return (
    <nav aria-label="Categories" className="sticky top-0 z-10 -mx-4 bg-linen/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        <Link href={href()} scroll={false} className={pill(!active)} aria-current={!active ? "page" : undefined}>All</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={href(c.id)} scroll={false} className={pill(active === c.id)} aria-current={active === c.id ? "page" : undefined}>
            {c.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
