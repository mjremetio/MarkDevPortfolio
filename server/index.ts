import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedContentFromDefaults } from "./seedContent";
import path from "path";
import fs from "fs";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Ensure the uploads directory exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  console.log('Creating uploads directory at:', uploadsDir);
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create a test image to make sure uploads work
const testImagePath = path.join(uploadsDir, 'test-image.svg');
if (!fs.existsSync(testImagePath)) {
  const testSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#f0f0f0" />
    <text x="50%" y="50%" font-family="Arial" font-size="16" text-anchor="middle" dominant-baseline="middle" fill="#333">Test Image</text>
  </svg>`;
  fs.writeFileSync(testImagePath, testSvg);
  console.log('Created test image at:', testImagePath);
}

// Serve static files from the public directory
app.use(express.static(path.join(process.cwd(), 'public')));
console.log('Serving static files from:', path.join(process.cwd(), 'public'));

// Add a specific route for serving uploads (as backup)
app.use('/uploads', express.static(uploadsDir));
console.log('Serving uploads from:', uploadsDir);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
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

(async () => {
  await seedContentFromDefaults().catch((error) => {
    console.error("Failed to seed content from JSON files:", error);
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const desiredPort = Number(process.env.PORT) || 5000;
  const canRetryOnRandomPort = !process.env.PORT && desiredPort === 5000;

  const startServer = (port: number, allowRetry: boolean) => {
    const listenOptions: Record<string, any> = {
      port,
      host: "0.0.0.0",
    };

    // reusePort is required on Replit but not supported on all local runtimes
    const shouldReusePort =
      process.env.REUSE_PORT === "true" ||
      (process.env.REUSE_PORT !== "false" && process.env.REPL_ID);

    if (shouldReusePort) {
      listenOptions.reusePort = true;
    }

    const onError = (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE" && allowRetry) {
        log(`Port ${port} is in use locally. Retrying on a random open port…`);
        server.off("error", onError);
        startServer(0, false);
        return;
      }

      server.off("error", onError);
      throw err;
    };

    server.once("error", onError);

    server.listen(listenOptions, () => {
      server.off("error", onError);
      const address = server.address();
      const actualPort =
        typeof address === "object" && address !== null
          ? address.port
          : address ?? port;
      log(`serving on port ${actualPort}`);
    });
  };

  startServer(desiredPort, canRetryOnRandomPort);
})();
