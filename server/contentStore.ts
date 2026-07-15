import fs from "fs";
import os from "os";
import path from "path";
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
 * DATABASE_URL). Every successful read is mirrored to an in-memory cache and to
 * a writable disk cache (os.tmpdir() — the only writable path on Vercel). If the
 * database is ever unreachable, the fallback chain is:
 *
 *   Supabase → in-memory cache → disk cache → bundled JSON (data/content.json)
 *
 * so an outage never surfaces empty or stale/test placeholder content.
 */

let pool: pg.Pool | null | undefined; // undefined = not initialised, null = disabled

const memCache = new Map<string, SectionPayload>();
const CACHE_DIR = path.join(os.tmpdir(), "mdp-content-cache");
const MEDIA_DIR = path.join(CACHE_DIR, "media");

function ensureDir(dir: string) {
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return true;
  } catch {
    return false;
  }
}

function writeSectionCache(section: string, payload: SectionPayload) {
  memCache.set(section, payload);
  if (!ensureDir(CACHE_DIR)) return;
  try {
    fs.writeFileSync(path.join(CACHE_DIR, `${section}.json`), JSON.stringify(payload), "utf-8");
  } catch (err) {
    console.warn("[contentStore] disk cache write failed:", (err as Error).message);
  }
}

function readSectionCache(section: string): SectionPayload | undefined {
  if (memCache.has(section)) return memCache.get(section);
  try {
    const raw = fs.readFileSync(path.join(CACHE_DIR, `${section}.json`), "utf-8");
    const parsed = JSON.parse(raw) as SectionPayload;
    memCache.set(section, parsed);
    return parsed;
  } catch {
    return undefined;
  }
}

function getPool(): pg.Pool | null {
  if (pool !== undefined) return pool;

  let url = process.env.DATABASE_URL;
  if (url) url = url.trim().replace(/^["']|["']$/g, ""); // tolerate quoted values
  if (!url) {
    console.warn("[contentStore] DATABASE_URL not set — using cache/JSON fallback.");
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
    console.error("[contentStore] pool init failed — using cache/JSON fallback.", err);
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
      if (r.rows[0]?.payload) {
        writeSectionCache(section, r.rows[0].payload); // keep the fallback fresh
        return r.rows[0].payload;
      }
    } catch (err) {
      console.error("[contentStore] getSection DB read failed, using cache:", (err as Error).message);
    }
  }
  // Fallbacks, freshest first: cache (mem → disk) then the bundled defaults.
  return readSectionCache(section) ?? jsonGet(section);
}

export async function listSectionsContent(): Promise<string[]> {
  const p = getPool();
  if (p) {
    try {
      const r = await p.query<{ section: string }>("select section from content_sections");
      const dbSections = r.rows.map((row) => row.section);
      return Array.from(new Set([...CONTENT_SECTION_NAMES, ...dbSections]));
    } catch (err) {
      console.error("[contentStore] listSections DB read failed, using cache:", (err as Error).message);
    }
  }
  return Array.from(
    new Set([...CONTENT_SECTION_NAMES, ...Array.from(memCache.keys()), ...jsonList()])
  );
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
      writeSectionCache(section, payload);
      return;
    } catch (err) {
      console.error("[contentStore] updateSection DB write failed, caching locally:", (err as Error).message);
    }
  }
  writeSectionCache(section, payload);
  jsonUpdate(section, payload);
}

/**
 * Legacy media (hero photo, project/gallery images) was stored as base64 in the
 * `media_uploads` table and referenced as `/api/uploads/{numericId}`. Served
 * from Supabase, and cached to disk so images survive a DB outage too.
 */
export async function getMediaById(
  id: number
): Promise<{ mime: string; buffer: Buffer } | null> {
  const p = getPool();
  if (p) {
    try {
      const r = await p.query<{ mime_type: string; data_base64: string }>(
        "select mime_type, data_base64 from media_uploads where id = $1 limit 1",
        [id]
      );
      if (r.rows[0]) {
        const mime = r.rows[0].mime_type || "application/octet-stream";
        const buffer = Buffer.from(r.rows[0].data_base64, "base64");
        cacheMedia(id, mime, buffer);
        return { mime, buffer };
      }
    } catch (err) {
      console.error("[contentStore] getMediaById DB read failed, using cache:", (err as Error).message);
    }
  }
  return readMediaCache(id);
}

function cacheMedia(id: number, mime: string, buffer: Buffer) {
  if (!ensureDir(MEDIA_DIR)) return;
  try {
    fs.writeFileSync(path.join(MEDIA_DIR, `${id}.bin`), buffer);
    fs.writeFileSync(path.join(MEDIA_DIR, `${id}.mime`), mime, "utf-8");
  } catch {
    /* best effort */
  }
}

function readMediaCache(id: number): { mime: string; buffer: Buffer } | null {
  try {
    const buffer = fs.readFileSync(path.join(MEDIA_DIR, `${id}.bin`));
    const mime = fs.readFileSync(path.join(MEDIA_DIR, `${id}.mime`), "utf-8");
    return { mime, buffer };
  } catch {
    return null;
  }
}
