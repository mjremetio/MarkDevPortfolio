import { Request, Response } from "express";
import { isValidSection } from "./jsonStorage";
import {
  getSectionContent,
  listSectionsContent,
  updateSectionContent,
} from "./contentStore";

export const listContentSections = async (_req: Request, res: Response) => {
  try {
    const sections = await listSectionsContent();
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

    const payload = await getSectionContent(section);

    if (!payload) {
      return res
        .status(404)
        .json({ success: false, message: "Content not found" });
    }

    res.json(payload);
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
    await updateSectionContent(section, payload);

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
