# Supabase Security — `rls_disabled_in_public`

## What the alert means

Supabase's Security Advisor reported a **Critical** issue:

> **Table publicly accessible** — Anyone with your project URL can read, edit, and
> delete all data in this table because Row-Level Security is not enabled.
> (`rls_disabled_in_public`)

Every table in the `public` schema is exposed through Supabase's auto-generated
REST/GraphQL API. The **anon key** is a *public* credential (it ships in front-end
code). If a `public` table has **Row-Level Security (RLS) disabled**, that anon key
can `SELECT` / `INSERT` / `UPDATE` / `DELETE` every row in it.

## Which tables and why

These tables are **leftovers** from before the app switched to JSON file storage
(commit `4ef58bc`, "Replace PostgreSQL with JSON file storage"). The code no longer
reads them, but the tables still live in the Supabase Postgres database:

| Table                    | Risk                                                        |
| ------------------------ | ----------------------------------------------------------- |
| `public.admins`          | **High** — stores admin `username` + `password_hash`        |
| `public.content_sections`| Medium — site content payloads                              |
| `public.media_uploads`   | Medium — base64 media blobs                                 |

The running app now:

- stores/serves content from `data/content.json` (`server/jsonStorage.ts`), and
- uses Supabase **only** for the Storage bucket, via the **service-role key**
  (`server/supabaseClient.ts`), which **bypasses RLS**.

So enabling RLS with **no policies** blocks the public anon key completely while
leaving the server's service-role access untouched. Nothing in the app breaks.

## How to fix

Apply [`supabase/migrations/20260703000000_enable_rls_public.sql`](supabase/migrations/20260703000000_enable_rls_public.sql).

**Option A — Dashboard (fastest):**
1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the contents of the migration file and **Run**.
3. Re-run the **Security Advisor** — the `rls_disabled_in_public` finding clears.

**Option B — Supabase CLI:**
```bash
supabase db push
# or, to run the single file:
supabase db execute --file supabase/migrations/20260703000000_enable_rls_public.sql
```

The migration:
1. **Enables + forces RLS** on the three legacy tables (and any other `public`
   table that still has it off), and
2. **Revokes** direct table/sequence privileges from the `anon` and
   `authenticated` roles for defense in depth.

## Recommended follow-ups

- **Rotate the admin password.** The hash in `public.admins` was publicly
  readable while RLS was off; treat it as compromised and set a new
  `ADMIN_PASSWORD`.
- **Drop the legacy tables.** They hold no live data now. The migration includes
  a commented `DROP TABLE` block you can enable once you've confirmed nothing else
  depends on them — the most thorough fix, as it removes the exposed hash entirely.
- **Storage bucket:** the `uploads` bucket is intentionally public so image URLs
  render on the site. That's expected; only make it private if you switch to
  signed URLs.
