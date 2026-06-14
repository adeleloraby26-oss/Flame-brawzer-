-- ============================================================
--  FLAME BROWSER — SUPABASE SQL SETUP v2 (Fixed)
--  نسخه في Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─────────────────────────────────────────────
-- 0. EXTENSIONS
-- ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────
-- 1. PROFILES
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  name            text          not null default 'Flame User',
  email           text          not null,
  avatar_url      text,
  rank            text          not null default 'Explorer'
                  check (rank in ('Explorer','Navigator','Pioneer','Voyager','Legend')),
  xp              integer       not null default 0 check (xp >= 0),
  level           integer       not null default 1 check (level >= 1),
  stats           jsonb         not null default '{
    "totalSearches": 0,
    "totalTabsOpened": 0,
    "dataBlocked": 0,
    "timeSaved": 0
  }'::jsonb,
  settings        jsonb         not null default '{
    "theme": "amoled",
    "searchEngine": "google",
    "enableAnimations": true,
    "enableHaptics": true,
    "blockAds": true,
    "blockTrackers": true,
    "savePasswords": true,
    "readerMode": false,
    "showFavicons": true,
    "compactMode": false,
    "bottomAddressBar": false
  }'::jsonb,
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now()
);

-- ─────────────────────────────────────────────
-- 2. SHARED TRIGGER: updated_at
-- ─────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- ─────────────────────────────────────────────
-- 3. AUTO-CREATE PROFILE ON SIGN UP
-- ─────────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- 4. BOOKMARK FOLDERS
-- ─────────────────────────────────────────────
create table if not exists public.bookmark_folders (
  id              uuid          primary key default uuid_generate_v4(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  name            text          not null,
  color           text          not null default '#FF4D00',
  sort_order      integer       not null default 0,
  created_at      timestamptz   not null default now()
);

create index if not exists idx_bookmark_folders_user on public.bookmark_folders(user_id);

-- ─────────────────────────────────────────────
-- 5. BOOKMARKS
-- ─────────────────────────────────────────────
create table if not exists public.bookmarks (
  id              uuid          primary key default uuid_generate_v4(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  url             text          not null,
  title           text          not null default '',
  favicon         text,
  folder_id       uuid          references public.bookmark_folders(id) on delete set null,
  visit_count     integer       not null default 0 check (visit_count >= 0),
  created_at      timestamptz   not null default now(),
  updated_at      timestamptz   not null default now(),
  unique (user_id, url)
);

create trigger bookmarks_updated_at
  before update on public.bookmarks
  for each row execute procedure public.set_updated_at();

create index if not exists idx_bookmarks_user   on public.bookmarks(user_id);
create index if not exists idx_bookmarks_folder on public.bookmarks(folder_id);
create index if not exists idx_bookmarks_url    on public.bookmarks(url);

-- ─────────────────────────────────────────────
-- 6. HISTORY
-- ─────────────────────────────────────────────
create table if not exists public.history (
  id              uuid          primary key default uuid_generate_v4(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  url             text          not null,
  title           text          not null default '',
  favicon         text,
  visit_count     integer       not null default 1 check (visit_count >= 1),
  visited_at      timestamptz   not null default now(),
  unique (user_id, url)
);

create index if not exists idx_history_user       on public.history(user_id);
create index if not exists idx_history_visited_at on public.history(visited_at desc);

-- upsert function
create or replace function public.upsert_history(
  p_user_id uuid,
  p_url     text,
  p_title   text,
  p_favicon text default null
)
returns public.history language plpgsql as $$
declare
  v_row public.history;
begin
  insert into public.history (user_id, url, title, favicon, visit_count, visited_at)
  values (p_user_id, p_url, p_title, p_favicon, 1, now())
  on conflict (user_id, url)
  do update set
    title       = excluded.title,
    favicon     = coalesce(excluded.favicon, history.favicon),
    visit_count = history.visit_count + 1,
    visited_at  = now()
  returning * into v_row;
  return v_row;
end;
$$;

-- ─────────────────────────────────────────────
-- 7. DOWNLOADS
-- ─────────────────────────────────────────────
create table if not exists public.downloads (
  id               uuid          primary key default uuid_generate_v4(),
  user_id          uuid          not null references public.profiles(id) on delete cascade,
  url              text          not null,
  filename         text          not null,
  mime_type        text          not null default 'application/octet-stream',
  size_bytes       bigint        not null default 0,
  downloaded_bytes bigint        not null default 0,
  status           text          not null default 'pending'
                   check (status in ('pending','downloading','completed','failed','paused')),
  started_at       timestamptz   not null default now(),
  completed_at     timestamptz,
  updated_at       timestamptz   not null default now()
);

create trigger downloads_updated_at
  before update on public.downloads
  for each row execute procedure public.set_updated_at();

create index if not exists idx_downloads_user   on public.downloads(user_id);
create index if not exists idx_downloads_status on public.downloads(status);

-- ─────────────────────────────────────────────
-- 8. TAB SESSIONS
-- ─────────────────────────────────────────────
create table if not exists public.tab_sessions (
  id              uuid          primary key default uuid_generate_v4(),
  user_id         uuid          not null references public.profiles(id) on delete cascade,
  device_name     text          not null default 'My Device',
  tabs            jsonb         not null default '[]'::jsonb,
  active_tab_id   text,
  saved_at        timestamptz   not null default now(),
  unique (user_id, device_name)
);

create index if not exists idx_tab_sessions_user on public.tab_sessions(user_id);

-- ─────────────────────────────────────────────
-- 9. SEARCH ENGINES
-- ─────────────────────────────────────────────
create table if not exists public.search_engines (
  id           text    primary key,
  name         text    not null,
  url_template text    not null,
  icon_url     text,
  color        text    not null default '#FFFFFF',
  is_default   boolean not null default false,
  is_builtin   boolean not null default true,
  sort_order   integer not null default 0
);

insert into public.search_engines (id, name, url_template, color, is_default, sort_order)
values
  ('google',     'Google',     'https://www.google.com/search?q={query}',       '#4285F4', true,  0),
  ('bing',       'Bing',       'https://www.bing.com/search?q={query}',         '#00809D', false, 1),
  ('duckduckgo', 'DuckDuckGo', 'https://duckduckgo.com/?q={query}',             '#DE5833', false, 2),
  ('brave',      'Brave',      'https://search.brave.com/search?q={query}',     '#FB542B', false, 3),
  ('ecosia',     'Ecosia',     'https://www.ecosia.org/search?q={query}',       '#4CAF50', false, 4)
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- 10. XP EVENTS
-- ─────────────────────────────────────────────
create table if not exists public.xp_events (
  id          uuid        primary key default uuid_generate_v4(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  event_type  text        not null,
  xp_gained   integer     not null check (xp_gained > 0),
  metadata    jsonb       default '{}'::jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists idx_xp_events_user on public.xp_events(user_id);

-- XP function: adds XP + recalculates rank automatically
create or replace function public.add_xp(
  p_user_id  uuid,
  p_event    text,
  p_xp       integer,
  p_metadata jsonb default '{}'::jsonb
)
returns void language plpgsql as $$
declare
  v_new_xp   integer;
  v_new_rank text;
begin
  insert into public.xp_events (user_id, event_type, xp_gained, metadata)
  values (p_user_id, p_event, p_xp, p_metadata);

  update public.profiles
  set xp = xp + p_xp
  where id = p_user_id
  returning xp into v_new_xp;

  v_new_rank := case
    when v_new_xp >= 100000 then 'Legend'
    when v_new_xp >= 40000  then 'Voyager'
    when v_new_xp >= 15000  then 'Pioneer'
    when v_new_xp >= 5000   then 'Navigator'
    else 'Explorer'
  end;

  update public.profiles
  set rank  = v_new_rank,
      level = greatest(1, floor(v_new_xp / 1000)::integer)
  where id = p_user_id;
end;
$$;

-- ─────────────────────────────────────────────
-- 11. ROW LEVEL SECURITY
-- ─────────────────────────────────────────────
alter table public.profiles         enable row level security;
alter table public.bookmarks        enable row level security;
alter table public.bookmark_folders enable row level security;
alter table public.history          enable row level security;
alter table public.downloads        enable row level security;
alter table public.tab_sessions     enable row level security;
alter table public.xp_events        enable row level security;
alter table public.search_engines   enable row level security;

-- profiles: PK is "id" not "user_id"
create policy "profiles_owner"
  on public.profiles for all
  using  (id = auth.uid())
  with check (id = auth.uid());

-- all other tables: PK is "user_id"
create policy "bookmarks_owner"
  on public.bookmarks for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "bookmark_folders_owner"
  on public.bookmark_folders for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "history_owner"
  on public.history for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "downloads_owner"
  on public.downloads for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "tab_sessions_owner"
  on public.tab_sessions for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "xp_events_owner"
  on public.xp_events for all
  using  (user_id = auth.uid())
  with check (user_id = auth.uid());

-- search_engines: everyone can read, no one can write (managed manually)
create policy "search_engines_read_all"
  on public.search_engines for select
  using (true);

-- ─────────────────────────────────────────────
-- 12. REALTIME
-- ─────────────────────────────────────────────
alter publication supabase_realtime add table public.bookmarks;
alter publication supabase_realtime add table public.history;
alter publication supabase_realtime add table public.tab_sessions;
alter publication supabase_realtime add table public.downloads;

-- ─────────────────────────────────────────────
-- 13. USEFUL VIEWS
-- ─────────────────────────────────────────────
create or replace view public.top_sites as
select
  user_id,
  url,
  max(title)        as title,
  max(favicon)      as favicon,
  sum(visit_count)  as total_visits,
  max(visited_at)   as last_visit
from public.history
group by user_id, url
order by total_visits desc;

create or replace view public.user_stats_view as
select
  p.id                                                          as user_id,
  p.name,
  p.rank,
  p.xp,
  p.level,
  count(distinct b.id)                                          as bookmark_count,
  count(distinct h.id)                                          as history_count,
  count(distinct d.id) filter (where d.status = 'completed')   as completed_downloads,
  coalesce(sum(x.xp_gained), 0)                                as total_xp_earned
from public.profiles p
left join public.bookmarks  b on b.user_id = p.id
left join public.history    h on h.user_id = p.id
left join public.downloads  d on d.user_id = p.id
left join public.xp_events  x on x.user_id = p.id
group by p.id;

-- ══════════════════════════════════════════════
--  ✅ DONE — كل التابلات جاهزة
-- ══════════════════════════════════════════════
