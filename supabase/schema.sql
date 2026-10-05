-- Germany Wire: run once in the Supabase SQL editor.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null unique,
  title_de text not null,
  title_en text not null,
  summary_en text not null,
  category text not null check (category in (
    'immigration','new-laws','jobs','taxes','money','healthcare',
    'social-benefits','housing','family','transport','other')),
  relevance_score int not null check (relevance_score between 0 and 100),
  published_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  is_time_sensitive boolean not null default false,
  deadline_date date
);

create index if not exists articles_published_idx on public.articles (published_at desc);
create index if not exists articles_category_idx on public.articles (category);

-- Public read, writes only via the service role key (server-side ingest).
alter table public.articles enable row level security;
drop policy if exists "public read" on public.articles;
create policy "public read" on public.articles for select using (true);

-- Phase 2 (accounts): bookmarks
-- create table public.user_saves (
--   user_id uuid references auth.users not null,
--   article_id uuid references public.articles on delete cascade not null,
--   saved_at timestamptz not null default now(),
--   primary key (user_id, article_id)
-- );
