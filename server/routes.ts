import type { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { getContent, updateContent, listContentSections } from './contentRoutes';
import { setupAuth, requireAuth } from './auth';
import multer from 'multer';
import { supabase, SUPABASE_STORAGE_BUCKET } from "./supabaseClient";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useSupabaseStorage = Boolean(supabase);

const diskUploadStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const baseDir = path.join(process.cwd(), "public", "uploads");

    console.log("Upload directory path:", baseDir);

    if (!fs.existsSync(baseDir)) {
      console.log("Creating upload directory at:", baseDir);
      fs.mkdirSync(baseDir, { recursive: true });
    }

    cb(null, baseDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const uploadStorage = useSupabaseStorage
  ? multer.memoryStorage()
  : diskUploadStorage;

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

const ensureUploadsDir = () => {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

const buildUniqueFilename = (originalName: string) => {
  const ext = path.extname(originalName);
  return `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
};

const uploadFileToSupabase = async (file: Express.Multer.File) => {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }

  const filename = buildUniqueFilename(file.originalname);
  const { error } = await supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .upload(filename, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(filename);

  return data.publicUrl;
};

const saveFile = async (file: Express.Multer.File) => {
  if (useSupabaseStorage) {
    return await uploadFileToSupabase(file);
  }

  ensureUploadsDir();
  return `/uploads/${file.filename}`;
};

const saveFiles = async (files: Express.Multer.File[]) =>
  Promise.all(files.map((file) => saveFile(file)));

export function registerRoutes(app: Express) {
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
  
  // Endpoint to check if an uploaded file exists
  app.get('/api/uploads/:filename', (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      
      console.log('Checking if file exists at:', filePath);
      
      if (fs.existsSync(filePath)) {
        // Return the URL to the file
        return res.status(200).json({
          exists: true,
          url: `/uploads/${filename}`
        });
      } else {
        return res.status(404).json({
          exists: false,
          message: 'File not found'
        });
      }
    } catch (error) {
      console.error('Error checking file:', error);
      return res.status(500).json({
        exists: false,
        message: 'Error checking file'
      });
    }
  });
  
  // Debug endpoint to list uploaded files
  app.get('/api/debug/uploads', requireAuth, (req: Request, res: Response) => {
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      
      if (!fs.existsSync(uploadsDir)) {
        return res.status(404).json({
          message: 'Uploads directory not found',
          path: uploadsDir
        });
      }
      
      const files = fs.readdirSync(uploadsDir);
      const fileData = files.map(file => {
        const fullPath = path.join(uploadsDir, file);
        const stats = fs.statSync(fullPath);
        return {
          name: file,
          path: `/uploads/${file}`,
          size: stats.size,
          created: stats.birthtime
        };
      });
      
      return res.status(200).json({
        directory: uploadsDir,
        count: files.length,
        files: fileData
      });
    } catch (error) {
      console.error('Error listing uploads:', error);
      return res.status(500).json({
        message: 'Error listing uploaded files'
      });
    }
  });
  
  // File upload routes
  app.post('/api/upload', requireAuth, upload.single('image'), async (req: Request, res: Response) => {
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
      const publicPath = await saveFile(req.file);
      
      return res.status(200).json({
        success: true,
        filePath: publicPath,
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
  app.post('/api/upload/multiple', requireAuth, upload.array('images', 10), async (req: Request, res: Response) => {
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
      
      const files = req.files as Express.Multer.File[];
      const filePaths = await saveFiles(files);
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

}
