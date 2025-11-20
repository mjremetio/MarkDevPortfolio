import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../server/app";

type Handler = (req: VercelRequest, res: VercelResponse) => void;

let cachedHandler: Handler | null = null;

async function getHandler(): Promise<Handler> {
  if (cachedHandler) {
    return cachedHandler;
  }

  const app = await createApp();
  cachedHandler = app as Handler;
  return cachedHandler;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const appHandler = await getHandler();
  return appHandler(req, res);
}
