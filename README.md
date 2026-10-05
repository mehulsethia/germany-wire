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
2. Set env vars (see [.env.example](.env.example)): `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` (free from aistudio.google.com/apikey) or `ANTHROPIC_API_KEY`, `CRON_SECRET`, optional `DIP_API_KEY`.
3. Deploy to Vercel. [vercel.json](vercel.json) runs `/api/cron/ingest` daily at 05:00 UTC (Vercel sends `CRON_SECRET` as a Bearer token).
4. Fill it the first time: `curl "https://YOUR-APP/api/cron/ingest?key=$CRON_SECRET"`

## Pipeline ([lib/pipeline.ts](lib/pipeline.ts))
fetch 4 sources (one failing never stops the rest) → dedupe by URL vs DB → the LLM (Gemini free tier, or Claude) translates, summarizes, scores 0-100, categorizes, flags deadlines ([lib/llm.ts](lib/llm.ts)) → drop below `RELEVANCE_THRESHOLD` (40) → upsert.

Sources (all free, no paid APIs): Tagesschau API, Bundesregierung RSS, BAMF press RSS, Bundestag RSS (12 topic feeds), Bundestag DIP API (free key, skipped without it), Bundesrat PlenumKOMPAKT RSS, Gesetze im Internet new-laws RSS. Not covered: make-it-in-germany.com and arbeitsagentur.de publish no RSS or news API.

## Notes
- Saves live in localStorage (no auth). `user_saves` table is sketched, commented, in the schema for later.
- Tagesschau items only carry a headline + topline, so the LLM has little to work with; those are scored mostly on title.
- Hobby-plan Vercel limits cron to daily and function time to 300s; `MAX_NEW_PER_RUN` caps LLM calls per run.
