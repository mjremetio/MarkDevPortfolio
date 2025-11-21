import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const contentSections = pgTable("content_sections", {
  id: serial("id").primaryKey(),
  section: varchar("section", { length: 64 }).notNull().unique(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const mediaUploads = pgTable("media_uploads", {
  id: serial("id").primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }).notNull(),
  size: integer("size").notNull(),
  dataBase64: text("data_base64").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

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
export type ContentSectionRecord = typeof contentSections.$inferSelect;
export type NewContentSection = typeof contentSections.$inferInsert;

export type AdminRecord = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type MediaUploadRecord = typeof mediaUploads.$inferSelect;
export type NewMediaUpload = typeof mediaUploads.$inferInsert;
