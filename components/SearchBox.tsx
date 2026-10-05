export default function SearchBox({ q, category }: { q?: string; category?: string }) {
  return (
    <form action="/" role="search" className="relative">
      {category && <input type="hidden" name="category" value={category} />}
      <label htmlFor="q" className="sr-only">Search the briefing</label>
      <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
      <input
        id="q"
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Search, e.g. Blue Card, rent, Kindergeld"
        className="h-12 w-full rounded-full border border-line bg-paper pl-11 pr-4 text-base text-ink placeholder:text-ink-faint focus:border-sage-deep focus:outline-none"
      />
    </form>
  );
}
