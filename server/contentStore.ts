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

/**
 * Legacy media (hero photo, project/gallery images) was stored as base64 in the
 * `media_uploads` table and referenced as `/api/uploads/{numericId}`. Serve
 * those straight from Supabase so the images resolve on Vercel.
 */
export async function getMediaById(
  id: number
): Promise<{ mime: string; buffer: Buffer } | null> {
  const p = getPool();
  if (!p) return null;
  try {
    const r = await p.query<{ mime_type: string; data_base64: string }>(
      "select mime_type, data_base64 from media_uploads where id = $1 limit 1",
      [id]
    );
    if (!r.rows[0]) return null;
    return {
      mime: r.rows[0].mime_type || "application/octet-stream",
      buffer: Buffer.from(r.rows[0].data_base64, "base64"),
    };
  } catch (err) {
    console.error("[contentStore] getMediaById failed:", (err as Error).message);
    return null;
  }
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
