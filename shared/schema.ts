export const CONTENT_SECTION_NAMES = [
  "hero",
  "about",
  "skills",
  "projects",
  "experience",
  "contact",
  "gallery",
] as const;

export type ContentSectionName = (typeof CONTENT_SECTION_NAMES)[number];
