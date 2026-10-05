import { NextResponse } from "next/server";
import { cooldownLeft, runLogged } from "@/lib/runs";
import { hasSupabase } from "@/lib/supabase";
import { llmConfigured } from "@/lib/llm";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// "Fetch now" button. Public, so it is protected by a cooldown instead of a secret.
export async function POST() {
  if (!hasSupabase() || !llmConfigured()) {
    return NextResponse.json({ error: "Fetching is not set up yet (missing Supabase or LLM keys)." }, { status: 503 });
  }
  const wait = await cooldownLeft();
  if (wait > 0) {
    return NextResponse.json({ error: "Just updated.", retryAfter: wait }, { status: 429 });
  }
  try {
    return NextResponse.json(await runLogged("manual"));
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
