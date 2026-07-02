import fs from "node:fs";
import pg from "pg";

// Read DATABASE_URL from .env.local without printing the secret.
const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
let url = line ? line.slice("DATABASE_URL=".length).trim() : process.env.DATABASE_URL;
url = (url || "").replace(/^["']|["']$/g, ""); // strip surrounding quotes
if (!url) {
  console.log("NO DATABASE_URL");
  process.exit(1);
}
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
try {
  await client.connect();
  const who = await client.query(
    "select current_user, current_setting('is_superuser') as super"
  );
  console.log("connected as:", who.rows[0].current_user, "| superuser:", who.rows[0].super);

  const t = await client.query(
    "select to_regclass('public.content_sections') as tbl, to_regclass('public.admins') as admins"
  );
  console.log("content_sections:", t.rows[0].tbl, "| admins:", t.rows[0].admins);

  if (t.rows[0].tbl) {
    const rls = await client.query(
      "select relrowsecurity, relforcerowsecurity from pg_class where oid = 'public.content_sections'::regclass"
    );
    console.log(
      "RLS enabled:",
      rls.rows[0].relrowsecurity,
      "| forced:",
      rls.rows[0].relforcerowsecurity
    );
    const rows = await client.query(
      "select section, jsonb_typeof(payload) as t, updated_at from content_sections order by section"
    );
    console.log("rows:", rows.rowCount);
    rows.rows.forEach((r) => console.log("  -", r.section, "(" + r.t + ")", r.updated_at));
  }
} catch (e) {
  console.log("DB ERROR:", e.code || "", e.message);
} finally {
  await client.end().catch(() => {});
}
