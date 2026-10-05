"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { reelScript } from "@/lib/reel";
import { useSaved } from "@/lib/useSaved";
import { useVotes } from "@/lib/useVotes";
import { IconBookmark, IconCheck, IconCopy, IconThumb } from "./icons";

export function useCopyReel(a: Article) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(reelScript(a));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this script:", reelScript(a));
    }
  }
  return { copied, copy };
}

const base = "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors";

export default function ArticleActions({ article: a, labels = true }: { article: Article; labels?: boolean }) {
  const { isSaved, toggle } = useSaved();
  const { copied, copy } = useCopyReel(a);
  const saved = isSaved(a.id);
  const { votes, vote } = useVotes();
  const mine = votes[a.id];
  return (
    <div className="flex w-full items-center gap-0.5">
      <button type="button" onClick={copy} title="Copy as reel script" aria-label="Copy as reel script" className={`${base} text-muted hover:bg-forest-wash hover:text-forest`}>
        {copied ? <IconCheck /> : <IconCopy />}
        {labels && <span aria-live="polite">{copied ? "Copied" : "Reel script"}</span>}
      </button>
      <button type="button" onClick={() => toggle(a.id)} aria-pressed={saved} title={saved ? "Remove from saved" : "Save for later"} aria-label={saved ? "Remove from saved" : "Save for later"} className={`${base} ${saved ? "bg-forest-wash text-forest" : "text-muted hover:bg-forest-wash hover:text-forest"}`}>
        <IconBookmark filled={saved} />
        {labels && (saved ? "Saved" : "Save")}
      </button>
      <span className="ml-auto flex items-center gap-0.5">
        <button type="button" onClick={() => vote(a.id, 1)} aria-pressed={mine === 1} title="Useful: show me more like this" aria-label="Mark as useful" className={`${base} px-1.5 ${mine === 1 ? "bg-forest-wash text-forest" : "text-faint hover:bg-forest-wash hover:text-forest"}`}>
          <IconThumb filled={mine === 1} />
        </button>
        <button type="button" onClick={() => vote(a.id, -1)} aria-pressed={mine === -1} title="Not useful: hide this and teach the filter" aria-label="Mark as not useful and hide" className={`${base} px-1.5 ${mine === -1 ? "bg-amber-wash text-amber-ink" : "text-faint hover:bg-amber-wash hover:text-amber-ink"}`}>
          <IconThumb down filled={mine === -1} />
        </button>
      </span>
    </div>
  );
}
