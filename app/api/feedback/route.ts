import { NextResponse } from "next/server";
import { hasSupabase, supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f-]{36}$/i;

// POST { id, voter, vote: 1 | -1 | 0 }  (0 removes the vote)
export async function POST(req: Request) {
  const { id, voter, vote } = (await req.json().catch(() => ({}))) as { id?: string; voter?: string; vote?: number };
  if (!id || !UUID.test(id) || !voter || voter.length > 64 || ![1, -1, 0].includes(vote as number)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!hasSupabase()) return NextResponse.json({ ok: true });
  const q = supabase().from("feedback");
  const { error } = vote === 0
    ? await q.delete().eq("article_id", id).eq("voter", voter)
    : await q.upsert({ article_id: id, voter, vote }, { onConflict: "article_id,voter" });
  return NextResponse.json({ ok: !error });
}
