import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as appStorage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { getContent, updateContent, listContentSections } from './contentRoutes';
import { setupAuth, requireAuth } from './auth';
import multer from 'multer';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const uploadStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Store uploads in the public directory so they can be accessed via the web
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    
    console.log('Upload directory path:', uploadDir);
    
    // Create the uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      console.log('Creating upload directory as it does not exist');
      fs.mkdirSync(uploadDir, { recursive: true });
    } else {
      console.log('Upload directory exists');
    }
    
    // Double check
    if (fs.existsSync(uploadDir)) {
      console.log('Upload directory confirmed to exist');
    } else {
      console.log('ERROR: Upload directory still does not exist after creation attempt');
    }
    
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

// File filter to only allow certain image types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(null, false);
    // You can throw an error instead if you want
    // cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({ 
  storage: uploadStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
  fileFilter: fileFilter
});

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
  
  // File upload routes
  app.post('/api/upload', requireAuth, upload.single('image'), (req: Request, res: Response) => {
    try {
      console.log('Upload request received');
      
      if (!req.file) {
        console.log('No file found in request');
        return res.status(400).json({
          success: false,
          message: 'No file uploaded or invalid file type'
        });
      }
      
      console.log('File uploaded:', req.file);
      console.log('File destination:', req.file.destination);
      console.log('File path:', req.file.path);
      
      // Verify the file exists at the saved path
      if (fs.existsSync(req.file.path)) {
        console.log('File confirmed to exist on disk at:', req.file.path);
      } else {
        console.log('WARNING: File does not exist at path:', req.file.path);
      }
      
      // Return the file path relative to the public directory
      const relativePath = '/uploads/' + req.file.filename;
      console.log('Returning relative path:', relativePath);
      
      return res.status(200).json({
        success: true,
        filePath: relativePath,
        message: 'File uploaded successfully!'
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading file'
      });
    }
  });

  // Multiple file upload route (for gallery)
  app.post('/api/upload/multiple', requireAuth, upload.array('images', 10), (req: Request, res: Response) => {
    try {
      console.log('Multiple upload request received');
      
      if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
        console.log('No files found in request');
        return res.status(400).json({
          success: false,
          message: 'No files uploaded or invalid file types'
        });
      }
      
      console.log('Files uploaded:', req.files);
      
      // Verify all files exist
      const files = req.files as Express.Multer.File[];
      files.forEach((file, index) => {
        console.log(`File ${index} destination:`, file.destination);
        console.log(`File ${index} path:`, file.path);
        
        if (fs.existsSync(file.path)) {
          console.log(`File ${index} confirmed to exist on disk at:`, file.path);
        } else {
          console.log(`WARNING: File ${index} does not exist at path:`, file.path);
        }
      });
      
      // Return the file paths relative to the public directory
      const filePaths = files.map(file => '/uploads/' + file.filename);
      console.log('Returning relative paths:', filePaths);
      
      return res.status(200).json({
        success: true,
        filePaths: filePaths,
        message: 'Files uploaded successfully!'
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      return res.status(500).json({
        success: false,
        message: 'Error uploading files'
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
