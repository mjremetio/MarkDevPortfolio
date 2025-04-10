import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentPath = path.join(__dirname, '../client/src/content');

export const getContent = (req: Request, res: Response) => {
  const { section } = req.params;
  
  try {
    const filePath = path.join(contentPath, `${section}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Content section '${section}' not found` });
    }
    
    const content = fs.readFileSync(filePath, 'utf-8');
    return res.json(JSON.parse(content));
  } catch (error) {
    console.error(`Error getting content for section '${section}':`, error);
    return res.status(500).json({ error: 'Failed to retrieve content' });
  }
};

export const updateContent = (req: Request, res: Response) => {
  const { section } = req.params;
  const content = req.body;
  
  try {
    const filePath = path.join(contentPath, `${section}.json`);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `Content section '${section}' not found` });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf-8');
    return res.json({ success: true, message: `Content for '${section}' updated successfully` });
  } catch (error) {
    console.error(`Error updating content for section '${section}':`, error);
    return res.status(500).json({ error: 'Failed to update content' });
  }
};

export const listContentSections = (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(contentPath);
    const sections = files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
      
    return res.json({ sections });
  } catch (error) {
    console.error('Error listing content sections:', error);
    return res.status(500).json({ error: 'Failed to list content sections' });
  }
};