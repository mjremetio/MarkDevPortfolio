import express, {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import path from "path";
import fs from "fs";
import { registerRoutes } from "./routes";
import { seedContentFromDefaults } from "./seedContent";
import { log } from "./vite";

let appPromise: Promise<Express> | null = null;

export function createApp(): Promise<Express> {
  if (!appPromise) {
    appPromise = initializeApp();
  }

  return appPromise;
}

async function initializeApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    console.log("Creating uploads directory at:", uploadsDir);
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const testImagePath = path.join(uploadsDir, "test-image.svg");
  if (!fs.existsSync(testImagePath)) {
    const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#f0f0f0" />
    <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#333">Test Image</text>
  </svg>`;
    fs.writeFileSync(testImagePath, testSvg);
    console.log("Created test image at:", testImagePath);
  }

  const publicDir = path.join(process.cwd(), "public");
  app.use(express.static(publicDir));
  console.log("Serving static files from:", publicDir);

  app.use("/uploads", express.static(uploadsDir));
  console.log("Serving uploads from:", uploadsDir);

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

  await seedContentFromDefaults().catch((error) => {
    console.error("Failed to seed content:", error);
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
