import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import fs from "fs";
import path from "path";
import { registerRoutes } from "./routes";
import { log } from "./logger";
import { isDiskUpload, uploadsDir } from "./uploadStrategy";

let appPromise: Promise<Express> | null = null;

export function createApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = initializeApp();
  }

  return appPromise;
}

async function initializeApp(): Promise<Express> {
  const app = express();

  if (process.env.VERCEL || process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  // Security headers middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    next();
  });

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: false }));

  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));
  console.log("Serving static files from:", publicDir);

  if (isDiskUpload) {
    if (!fs.existsSync(uploadsDir)) {
      console.log("Creating uploads directory at:", uploadsDir);
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    app.use("/uploads", express.static(uploadsDir));
    console.log("Serving uploads from:", uploadsDir);
  } else {
    console.log("Disk uploads disabled in this environment. Skipping static uploads mount.");
  }

  app.use((req, res, next) => {
    const start = Date.now();
    const requestPath = req.path;
    let capturedJsonResponse: Record<string, any> | undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (requestPath.startsWith("/api")) {
        let logLine = `${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  return app;
}
