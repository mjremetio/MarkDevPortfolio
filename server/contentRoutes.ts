import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import {
  contentSections,
  CONTENT_SECTION_NAMES,
  type ContentSectionName,
} from "@shared/schema";
import { db } from "./db";

const isValidSection = (section: string): section is ContentSectionName =>
  CONTENT_SECTION_NAMES.includes(section as ContentSectionName);

export const listContentSections = async (_req: Request, res: Response) => {
  try {
    const rows = await db
      .select({ section: contentSections.section })
      .from(contentSections);

    const sections = Array.from(
      new Set([
        ...CONTENT_SECTION_NAMES,
        ...rows.map((row) => row.section),
      ]),
    );

    res.json({ sections });
  } catch (error) {
    console.error("Error listing content sections:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to list content sections" });
  }
};

export const getContent = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;

    if (!isValidSection(section)) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    const [record] = await db
      .select({ payload: contentSections.payload })
      .from(contentSections)
      .where(eq(contentSections.section, section));

    if (!record) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }

    res.json(record.payload);
  } catch (error) {
    console.error("Error fetching content:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch content" });
  }
};

export const updateContent = async (req: Request, res: Response) => {
  try {
    const { section } = req.params;

    if (!isValidSection(section)) {
      return res
        .status(404)
        .json({ success: false, message: "Section not found" });
    }

    if (typeof req.body !== "object" || req.body === null) {
      return res.status(400).json({
        success: false,
        message: "Invalid payload. Expected a JSON object.",
      });
    }

    const payload = req.body as Record<string, unknown>;

    await db
      .insert(contentSections)
      .values({ section, payload })
      .onConflictDoUpdate({
        target: contentSections.section,
        set: { payload, updatedAt: new Date() },
      });

    res.json({
      success: true,
      message: `${section} content updated successfully`,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update content" });
  }
};
