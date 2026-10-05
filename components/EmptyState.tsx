import Link from "next/link";

export default function EmptyState({ filtered, saved }: { filtered?: boolean; saved?: boolean }) {
  return (
    <div className="rounded-3xl border border-dashed border-sage/50 px-6 py-14 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-sage-wash text-sage-deep" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11h13a3 3 0 0 1 0 6h-1M4 11v4a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-4M8 4c0 1.2-1 1.5-1 2.5M12 4c0 1.2-1 1.5-1 2.5" /></svg>
      </div>
      <h2 className="font-serif text-2xl font-semibold text-sage-deep">
        {saved ? "Nothing saved yet" : filtered ? "Nothing here right now" : "Nothing new today, enjoy the break"}
      </h2>
      <p className="mx-auto mt-2 max-w-sm leading-relaxed text-ink-soft">
        {saved
          ? "Tap Save on anything you will need later, like a new rule you have to deal with in person."
          : filtered
            ? "Try another category or a different search. Nothing urgent is hiding from you."
            : "No German admin surprises at the moment. We will tell you when something changes."}
      </p>
      {(filtered || saved) && (
        <Link href="/" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-sage-deep px-5 text-sm font-medium text-paper">
          Back to the briefing
        </Link>
      )}
    </div>
  );
}
