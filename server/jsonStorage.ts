import fs from "fs";
import path from "path";

export type ContentSectionName =
  | "hero"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "contact"
  | "gallery";

export const CONTENT_SECTION_NAMES: readonly ContentSectionName[] = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
  "gallery",
] as const;

type SectionPayload = Record<string, unknown>;
type ContentStore = Record<string, SectionPayload>;

const DATA_FILE = path.join(process.cwd(), "data", "content.json");

let contentCache: ContentStore | null = null;

function loadContent(): ContentStore {
  if (contentCache) return contentCache;

  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    contentCache = JSON.parse(raw) as ContentStore;
  } catch {
    console.warn("[jsonStorage] Could not read", DATA_FILE, "— using empty store");
    contentCache = {};
  }

  return contentCache;
}

function persistContent(data: ContentStore): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("[jsonStorage] Failed to persist content:", err);
  }
}

export function getSection(section: string): SectionPayload | undefined {
  const store = loadContent();
  return store[section];
}

export function listSections(): string[] {
  const store = loadContent();
  const stored = Object.keys(store);
  const all = new Set([...CONTENT_SECTION_NAMES, ...stored]);
  return Array.from(all);
}

export function updateSection(section: string, payload: SectionPayload): void {
  const store = loadContent();
  store[section] = payload;
  contentCache = store;
  persistContent(store);
}

export function isValidSection(section: string): section is ContentSectionName {
  return (CONTENT_SECTION_NAMES as readonly string[]).includes(section);
}
