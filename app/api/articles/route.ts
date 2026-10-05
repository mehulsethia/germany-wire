import { NextResponse } from "next/server";
import { getByIds } from "@/lib/data";

export const dynamic = "force-dynamic";

// POST { ids: string[] } -> saved articles (used by the Saved page; ids live in localStorage)
export async function POST(req: Request) {
  const { ids } = (await req.json().catch(() => ({}))) as { ids?: unknown };
  const list = Array.isArray(ids) ? ids.filter((i): i is string => typeof i === "string").slice(0, 100) : [];
  return NextResponse.json({ articles: await getByIds(list) });
}
