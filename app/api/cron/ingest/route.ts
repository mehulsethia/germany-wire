import { NextResponse } from "next/server";
import { runIngest } from "@/lib/pipeline";
import { hasSupabase } from "@/lib/supabase";
import { llmConfigured } from "@/lib/llm";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authed =
    req.headers.get("authorization") === `Bearer ${secret}` ||
    new URL(req.url).searchParams.get("key") === secret;
  if (!secret || !authed) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!hasSupabase() || !llmConfigured()) {
    return NextResponse.json({ error: "missing Supabase env vars or GEMINI_API_KEY / ANTHROPIC_API_KEY" }, { status: 500 });
  }
  try {
    return NextResponse.json(await runIngest());
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
