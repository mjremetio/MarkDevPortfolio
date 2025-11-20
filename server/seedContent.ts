import { eq } from "drizzle-orm";
import {
  contentSections,
  CONTENT_SECTION_NAMES,
  type ContentSectionName,
} from "@shared/schema";
import { defaultContent } from "@shared/defaultContent";
import { db } from "./db";

type SeedOptions = {
  replaceExisting?: boolean;
};

export async function seedContentFromDefaults(options: SeedOptions = {}) {
  const { replaceExisting = false } = options;

  let inserted = 0;
  let updated = 0;

  for (const section of CONTENT_SECTION_NAMES) {
    const sectionName = section as ContentSectionName;
    const payload = defaultContent[sectionName];
    if (!payload) continue;

    const [existing] = await db
      .select({ id: contentSections.id })
      .from(contentSections)
      .where(eq(contentSections.section, sectionName));

    if (existing && !replaceExisting) {
      continue;
    }

    if (existing && replaceExisting) {
      await db
        .update(contentSections)
        .set({ payload, updatedAt: new Date() })
        .where(eq(contentSections.section, sectionName));
      updated += 1;
      continue;
    }

    await db
      .insert(contentSections)
      .values({ section: sectionName, payload })
      .onConflictDoNothing();
    inserted += 1;
  }

  if (inserted || updated) {
    console.log(`[seed] Content synced. Inserted: ${inserted}, Updated: ${updated}`);
  } else {
    console.log("[seed] Content already up to date.");
  }

  return { inserted, updated };
}
