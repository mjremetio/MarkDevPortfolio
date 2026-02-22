import type { Express, Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function rateLimit(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ message: "Too many requests. Please try again later." });
    }

    entry.count++;
    return next();
  };
}

// Clean up expired rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000);
import { desc, eq } from "drizzle-orm";
import { mediaUploads } from "@shared/schema";
import { getContent, updateContent, listContentSections } from "./contentRoutes";
import { setupAuth, requireAuth } from "./auth";
import { db } from "./db";
import {
  isDatabaseUpload,
  isDiskUpload,
  isSupabaseUpload,
  uploadsDir,
} from "./uploadStrategy";
import { supabase, SUPABASE_STORAGE_BUCKET } from "./supabaseClient";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const useSupabaseStorage = isSupabaseUpload && Boolean(supabase);
const useDatabaseStorage = isDatabaseUpload;
const useDiskStorage = isDiskUpload;
const useMemoryStorage = useSupabaseStorage || useDatabaseStorage;

const diskUploadStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    if (!fs.existsSync(uploadsDir)) {
      console.log("Creating upload directory at:", uploadsDir);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = file.fieldname + '-' + uniqueSuffix + ext;
    console.log('Generated filename:', filename);
    cb(null, filename);
  }
});

const uploadStorage = useMemoryStorage
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
  if (!useDiskStorage) {
    return uploadsDir;
  }

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  return uploadsDir;
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

const saveFileToDatabase = async (file: Express.Multer.File) => {
  if (!file.buffer) {
    throw new Error("File buffer is not available for database storage");
  }

  const storedFilename = buildUniqueFilename(file.originalname);

  const [record] = await db
    .insert(mediaUploads)
    .values({
      filename: storedFilename,
      mimeType: file.mimetype,
      size: file.size,
      dataBase64: file.buffer.toString("base64"),
    })
    .returning({ id: mediaUploads.id });

  if (!record) {
    throw new Error("Failed to persist uploaded file");
  }

  return `/api/uploads/${record.id}`;
};

const saveFile = async (file: Express.Multer.File) => {
  if (useSupabaseStorage) {
    return await uploadFileToSupabase(file);
  }

  if (useDatabaseStorage) {
    return await saveFileToDatabase(file);
  }

  ensureUploadsDir();
  return `/api/uploads/${file.filename}`;
};

const saveFiles = async (files: Express.Multer.File[]) =>
  Promise.all(files.map((file) => saveFile(file)));

export function registerRoutes(app: Express) {
  // Set up authentication
  setupAuth(app);
  // Contact form submission endpoint (rate limited: 5 requests per 15 minutes)
  app.post('/api/contact', rateLimit(5, 15 * 60 * 1000), async (req: Request, res: Response) => {
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
  
  // Endpoint to serve stored uploads
  app.get('/api/uploads/:id', async (req: Request, res: Response) => {
    try {
      if (useDatabaseStorage) {
        const uploadId = Number(req.params.id);

        if (Number.isNaN(uploadId)) {
          return res.status(400).json({ message: 'Invalid file identifier' });
        }

        const [record] = await db
          .select({
            id: mediaUploads.id,
            filename: mediaUploads.filename,
            mimeType: mediaUploads.mimeType,
            size: mediaUploads.size,
            dataBase64: mediaUploads.dataBase64,
          })
          .from(mediaUploads)
          .where(eq(mediaUploads.id, uploadId))
          .limit(1);

        if (!record) {
          return res.status(404).json({ message: 'File not found' });
        }

        const fileBuffer = Buffer.from(record.dataBase64, "base64");

        res.setHeader('Content-Type', record.mimeType);
        res.setHeader('Content-Length', record.size.toString());
        res.setHeader(
          'Content-Disposition',
          `inline; filename="${record.filename}"`,
        );
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

        return res.send(fileBuffer);
      }

      const filename = path.basename(req.params.id);
      if (filename !== req.params.id || filename.includes('..')) {
        return res.status(400).json({ message: 'Invalid filename' });
      }

      const filePath = path.resolve(path.join(uploadsDir, filename));
      if (!filePath.startsWith(path.resolve(uploadsDir))) {
        return res.status(400).json({ message: 'Invalid file path' });
      }

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
      }

      return res.sendFile(filePath);
    } catch (error) {
      console.error('Error serving uploaded file:', error);
      return res.status(500).json({
        message: 'Error serving file',
      });
    }
  });
  
  // Debug endpoint to list uploaded files
  app.get('/api/debug/uploads', requireAuth, async (_req: Request, res: Response) => {
    try {
      if (useDatabaseStorage) {
        const rows = await db
          .select({
            id: mediaUploads.id,
            filename: mediaUploads.filename,
            size: mediaUploads.size,
            mimeType: mediaUploads.mimeType,
            createdAt: mediaUploads.createdAt,
          })
          .from(mediaUploads)
          .orderBy(desc(mediaUploads.createdAt))
          .limit(100);

        return res.status(200).json({
          strategy: 'database',
          count: rows.length,
          files: rows.map((row) => ({
            id: row.id,
            path: `/api/uploads/${row.id}`,
            filename: row.filename,
            size: row.size,
            mimeType: row.mimeType,
            createdAt: row.createdAt,
          })),
        });
      }

      if (!fs.existsSync(uploadsDir)) {
        return res.status(404).json({
          message: 'Uploads directory not found',
          path: uploadsDir,
        });
      }

      const files = fs.readdirSync(uploadsDir);
      const fileData = files.map((file) => {
        const fullPath = path.join(uploadsDir, file);
        const stats = fs.statSync(fullPath);
        return {
          name: file,
          path: `/api/uploads/${file}`,
          size: stats.size,
          created: stats.birthtime,
        };
      });

      return res.status(200).json({
        strategy: 'disk',
        directory: uploadsDir,
        count: files.length,
        files: fileData,
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
