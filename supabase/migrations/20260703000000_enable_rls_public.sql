-- =============================================================================
-- Security fix: rls_disabled_in_public
-- =============================================================================
-- Supabase's advisor flagged one or more tables in the `public` schema with
-- Row-Level Security (RLS) DISABLED. With RLS off, anyone holding the project's
-- anon key (which ships in any client that talks to Supabase) can read, edit,
-- and delete every row in those tables through the auto-generated REST/GraphQL
-- API — including `public.admins`, which stores an admin username + password
-- hash.
--
-- These tables are LEGACY: this app moved to JSON file storage
-- (see data/content.json + server/jsonStorage.ts) and now only uses Supabase
-- for the Storage bucket, accessed server-side with the SERVICE ROLE key. The
-- service_role bypasses RLS, so enabling RLS with NO permissive policies fully
-- blocks anonymous access without breaking anything the app does.
--
-- Apply this in the Supabase Dashboard → SQL Editor, or via `supabase db push`.
-- Every statement is idempotent and safe to re-run.
-- =============================================================================

begin;

-- 1) Enable + FORCE RLS on the known legacy tables.
--    FORCE makes even the table owner subject to RLS; service_role still bypasses.
alter table if exists public.admins           enable row level security;
alter table if exists public.admins           force  row level security;

alter table if exists public.content_sections enable row level security;
alter table if exists public.content_sections force  row level security;

alter table if exists public.media_uploads    enable row level security;
alter table if exists public.media_uploads    force  row level security;

-- 2) Belt-and-suspenders: enable + force RLS on ANY other table in `public`
--    that still has it disabled, so the advisor is fully cleared even if the
--    schema drifts.
do $$
declare
  r record;
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'r'          -- ordinary tables
      and c.relrowsecurity = false -- RLS currently disabled
  loop
    execute format('alter table public.%I enable row level security;', r.relname);
    execute format('alter table public.%I force  row level security;', r.relname);
  end loop;
end $$;

-- 3) Defense in depth: revoke direct table privileges from the API roles.
--    With no GRANTs and no policies, `anon` / `authenticated` cannot touch the
--    data at all. The app never queries these tables via those roles.
revoke all on all tables    in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

commit;

-- =============================================================================
-- OPTIONAL — the cleanest fix, since these tables are unused after the JSON
-- migration. Uncomment and run ONLY after confirming nothing else depends on
-- them (they hold no live application data in this codebase). Dropping them
-- also removes the exposed admin password hash entirely.
-- =============================================================================
-- begin;
--   drop table if exists public.media_uploads;
--   drop table if exists public.content_sections;
--   drop table if exists public.admins;
-- commit;
