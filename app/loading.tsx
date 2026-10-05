export default function Loading() {
  return (
    <div role="status" aria-live="polite">
      <p className="mb-6 text-sm text-muted">Gathering this morning's briefing…</p>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-52 animate-pulse rounded-[10px] border border-line bg-surface" />)}
      </div>
    </div>
  );
}
