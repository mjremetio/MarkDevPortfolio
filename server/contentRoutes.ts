import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Content sections data store
const CONTENT_SECTIONS = ['hero', 'about', 'skills', 'projects', 'experience', 'contact'];
const CONTENT_DIR = path.join(__dirname, '../client/src/content');

// Ensure content directory exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

// Get all content sections
export const listContentSections = (_req: Request, res: Response) => {
  try {
    res.json({ sections: CONTENT_SECTIONS });
  } catch (error) {
    console.error('Error listing content sections:', error);
    res.status(500).json({ success: false, message: 'Failed to list content sections' });
  }
};

// Get content for a specific section
export const getContent = (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    
    // Validate section name
    if (!CONTENT_SECTIONS.includes(section)) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    
    const contentFilePath = path.join(CONTENT_DIR, `${section}.json`);
    
    // Check if file exists
    if (!fs.existsSync(contentFilePath)) {
      return res.status(404).json({ success: false, message: 'Content file not found' });
    }
    
    // Read file content
    const fileContent = fs.readFileSync(contentFilePath, 'utf-8');
    const contentData = JSON.parse(fileContent);
    
    res.json(contentData);
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch content' });
  }
};

// Update content for a specific section
export const updateContent = (req: Request, res: Response) => {
  try {
    const { section } = req.params;
    const contentData = req.body;
    
    // Validate section name
    if (!CONTENT_SECTIONS.includes(section)) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }
    
    // Ensure content directory exists
    if (!fs.existsSync(CONTENT_DIR)) {
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
    }
    
    const contentFilePath = path.join(CONTENT_DIR, `${section}.json`);
    
    // Write content to file
    fs.writeFileSync(contentFilePath, JSON.stringify(contentData, null, 2));
    
    res.json({ success: true, message: `${section} content updated successfully` });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ success: false, message: 'Failed to update content' });
  }
};