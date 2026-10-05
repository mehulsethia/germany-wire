# Germany Wire

Calm, plain-English briefing of German news and admin changes for expats. Next.js (App Router) + Tailwind + Supabase + Claude.

## Run it
```bash
npm i
cp .env.example .env.local   # fill in keys
npm run dev
```
With no Supabase keys the app shows clearly-labelled **sample content**, so the UI works for a demo straight away.

## Go live
1. Supabase: create a project, run [supabase/schema.sql](supabase/schema.sql) in the SQL editor.
2. Set env vars (see [.env.example](.env.example)): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `CRON_SECRET`, optional `DIP_API_KEY`.
3. Deploy to Vercel. [vercel.json](vercel.json) runs `/api/cron/ingest` daily at 05:00 UTC (Vercel sends `CRON_SECRET` as a Bearer token).
4. Fill it the first time: `curl "https://YOUR-APP/api/cron/ingest?key=$CRON_SECRET"`

## Pipeline ([lib/pipeline.ts](lib/pipeline.ts))
fetch 4 sources (one failing never stops the rest) → dedupe by URL vs DB → Claude translates, summarizes, scores 0-100, categorizes, flags deadlines ([lib/llm.ts](lib/llm.ts)) → drop below `RELEVANCE_THRESHOLD` (40) → upsert.

Sources: Tagesschau API, Bundestag DIP (needs free `DIP_API_KEY`; skipped without it), BAMF press RSS, Bundesregierung RSS. Feed URLs can be overridden with `BAMF_RSS_URL` / `BREG_RSS_URL`.

## Notes
- Saves live in localStorage (no auth). `user_saves` table is sketched, commented, in the schema for later.
- Tagesschau items only carry a headline + topline, so the LLM has little to work with; those are scored mostly on title.
- Hobby-plan Vercel limits cron to daily and function time to 300s; `MAX_NEW_PER_RUN` caps LLM calls per run.
