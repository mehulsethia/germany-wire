export default function Loading() {
  return (
    <div role="status" aria-live="polite" className="breathe space-y-4">
      <p className="font-serif text-xl text-sage-deep">Gathering this morning's briefing…</p>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-44 rounded-3xl bg-paper/70 shadow-soft" />
      ))}
    </div>
  );
}
