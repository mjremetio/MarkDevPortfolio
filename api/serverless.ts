import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

type Handler = (req: VercelRequest, res: VercelResponse) => void;

let cachedHandler: Handler | null = null;

async function getHandler(): Promise<Handler> {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await loadApp();
  cachedHandler = app as Handler;
  return cachedHandler;
}

async function loadApp() {
  const distAppPath = path.join(process.cwd(), "dist", "server", "app.js");
  const hasDistApp = fs.existsSync(distAppPath);
  console.log("[api/serverless] dist app path:", distAppPath, "exists:", hasDistApp);

  if (hasDistApp) {
    const module: Record<string, any> = await import(
      pathToFileURL(distAppPath).href
    );
    if (typeof module.createApp === "function") {
      return module.createApp();
    }
    if (typeof module.default === "function") {
      return module.default();
    }
    if (typeof module.default?.createApp === "function") {
      return module.default.createApp();
    }
  }

  const module: Record<string, any> = await import("../server/app");
  if (typeof module.createApp === "function") {
    return module.createApp();
  }
  if (typeof module.default === "function") {
    return module.default();
  }
  if (typeof module.default?.createApp === "function") {
    return module.default.createApp();
  }

  throw new Error("Unable to load Express app");
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const appHandler = await getHandler();
  return appHandler(req, res);
}
