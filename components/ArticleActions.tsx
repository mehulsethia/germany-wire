"use client";
import { useState } from "react";
import type { Article } from "@/lib/types";
import { reelScript } from "@/lib/reel";
import { useSaved } from "@/lib/useSaved";
import { IconBookmark, IconCheck, IconCopy } from "./icons";

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
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" onClick={copy} title="Copy as reel script" aria-label="Copy as reel script" className={`${base} text-muted hover:bg-forest-wash hover:text-forest`}>
        {copied ? <IconCheck /> : <IconCopy />}
        {labels && <span aria-live="polite">{copied ? "Copied" : "Reel script"}</span>}
      </button>
      <button type="button" onClick={() => toggle(a.id)} aria-pressed={saved} title={saved ? "Remove from saved" : "Save for later"} aria-label={saved ? "Remove from saved" : "Save for later"} className={`${base} ${saved ? "bg-forest-wash text-forest" : "text-muted hover:bg-forest-wash hover:text-forest"}`}>
        <IconBookmark filled={saved} />
        {labels && (saved ? "Saved" : "Save")}
      </button>
    </div>
  );
}
