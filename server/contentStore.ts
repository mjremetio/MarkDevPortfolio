import pg from "pg";
import {
  getSection as jsonGet,
  listSections as jsonList,
  updateSection as jsonUpdate,
  CONTENT_SECTION_NAMES,
} from "./jsonStorage";

type SectionPayload = Record<string, unknown>;

/**
 * Content is served from Supabase Postgres (the `content_sections` table over
 * DATABASE_URL) so admin edits persist across Vercel's ephemeral filesystem.
 * Every path falls back to the bundled JSON store (data/content.json) if the
 * database is unconfigured or unreachable, so the site never goes blank.
 */

let pool: pg.Pool | null | undefined; // undefined = not initialised, null = disabled

function getPool(): pg.Pool | null {
  if (pool !== undefined) return pool;

  let url = process.env.DATABASE_URL;
  if (url) url = url.trim().replace(/^["']|["']$/g, ""); // tolerate quoted values
  if (!url) {
    console.warn("[contentStore] DATABASE_URL not set — using JSON fallback.");
    pool = null;
    return pool;
  }

  try {
    pool = new pg.Pool({
      connectionString: url,
      ssl: { rejectUnauthorized: false },
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
    pool.on("error", (err) => console.error("[contentStore] pool error:", err.message));
    console.log("[contentStore] Supabase Postgres pool ready.");
  } catch (err) {
    console.error("[contentStore] pool init failed — using JSON fallback.", err);
    pool = null;
  }
  return pool;
}

export async function getSectionContent(
  section: string
): Promise<SectionPayload | undefined> {
  const p = getPool();
  if (p) {
    try {
      const r = await p.query<{ payload: SectionPayload }>(
        "select payload from content_sections where section = $1 limit 1",
        [section]
      );
      if (r.rows[0]?.payload) return r.rows[0].payload;
    } catch (err) {
      console.error("[contentStore] getSection DB read failed, falling back:", (err as Error).message);
    }
  }
  return jsonGet(section);
}

export async function listSectionsContent(): Promise<string[]> {
  const p = getPool();
  if (p) {
    try {
      const r = await p.query<{ section: string }>("select section from content_sections");
      const dbSections = r.rows.map((row) => row.section);
      return Array.from(new Set([...CONTENT_SECTION_NAMES, ...dbSections]));
    } catch (err) {
      console.error("[contentStore] listSections DB read failed, falling back:", (err as Error).message);
    }
  }
  return jsonList();
}

export async function updateSectionContent(
  section: string,
  payload: SectionPayload
): Promise<void> {
  const p = getPool();
  if (p) {
    try {
      await p.query(
        `insert into content_sections (section, payload, updated_at)
         values ($1, $2::jsonb, now())
         on conflict (section) do update set payload = excluded.payload, updated_at = now()`,
        [section, JSON.stringify(payload)]
      );
      return;
    } catch (err) {
      console.error("[contentStore] updateSection DB write failed, falling back to JSON:", (err as Error).message);
    }
  }
  jsonUpdate(section, payload);
}
