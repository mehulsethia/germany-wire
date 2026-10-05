import { runIngest } from "./pipeline";
import { supabase } from "./supabase";

export const COOLDOWN_SECONDS = 300;
let lastStartMemory = 0; // fallback if the ingest_runs table has not been created

/** Seconds until another manual run is allowed (0 = go ahead). */
export async function cooldownLeft(): Promise<number> {
  const { data, error } = await supabase()
    .from("ingest_runs")
    .select("started_at")
    .order("started_at", { ascending: false })
    .limit(1);
  const last = !error && data?.[0] ? new Date(data[0].started_at).getTime() : lastStartMemory;
  return Math.max(0, Math.ceil((last + COOLDOWN_SECONDS * 1000 - Date.now()) / 1000));
}

export async function lastUpdated(): Promise<string | null> {
  const runs = await supabase()
    .from("ingest_runs")
    .select("finished_at")
    .eq("status", "ok")
    .order("finished_at", { ascending: false })
    .limit(1);
  if (!runs.error && runs.data?.[0]?.finished_at) return runs.data[0].finished_at;
  const art = await supabase().from("articles").select("fetched_at").order("fetched_at", { ascending: false }).limit(1);
  return art.data?.[0]?.fetched_at ?? null;
}

export async function runLogged(trigger: "cron" | "manual") {
  lastStartMemory = Date.now();
  const { data: row } = await supabase().from("ingest_runs").insert({ trigger }).select("id").single();
  const finish = (patch: Record<string, unknown>) =>
    row ? supabase().from("ingest_runs").update({ finished_at: new Date().toISOString(), ...patch }).eq("id", row.id) : null;
  try {
    const r = await runIngest();
    await finish({ status: "ok", stored: r.stored, discarded: r.discarded, remaining: r.remaining });
    return r;
  } catch (e) {
    await finish({ status: "error", error: (e as Error).message.slice(0, 300) });
    throw e;
  }
}
