import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import { getContent, updateContent, listContentSections } from './contentRoutes';
import { setupAuth, requireAuth } from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Contact form submission endpoint
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;
      
      // Basic validation
      if (!name || !email || !message) {
        return res.status(400).json({ message: 'Please provide name, email, and message' });
      }
      
      // Here you would typically send an email
      // For now, just log the message and return success
      console.log('Contact form submission:', { name, email, subject, message });
      
      return res.status(200).json({ message: 'Message received successfully' });
    } catch (error) {
      console.error('Error handling contact form:', error);
      return res.status(500).json({ message: 'Error processing your request' });
    }
  });

  // Resume download endpoint
  app.get('/api/download-resume', (req: Request, res: Response) => {
    try {
      const resumePath = path.join(__dirname, '../attached_assets/Mark Remetio - CV (1).pdf');
      
      if (fs.existsSync(resumePath)) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Mark_Remetio_CV.pdf');
        
        // Create a read stream and pipe it to the response
        const fileStream = fs.createReadStream(resumePath);
        fileStream.pipe(res);
      } else {
        res.status(404).json({ message: 'Resume file not found' });
      }
    } catch (error) {
      console.error('Error serving resume file:', error);
      res.status(500).json({ message: 'Error downloading resume' });
    }
  });

  // Content management routes
  app.get('/api/content', listContentSections);
  app.get('/api/content/:section', getContent);
  app.post('/api/content/:section', requireAuth, updateContent);

  const httpServer = createServer(app);

  return httpServer;
}
