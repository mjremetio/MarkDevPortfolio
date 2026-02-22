import {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { createHash } from "crypto";

// Login rate limiter: 10 attempts per 15 minutes per IP
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxAttempts = 10;
  const entry = loginAttempts.get(ip);

  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + windowMs });
    return next();
  }

  if (entry.count >= maxAttempts) {
    return res.status(429).json({ success: false, message: "Too many login attempts. Please try again later." });
  }

  entry.count++;
  return next();
}

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "password123";
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  createHash("sha256").update(ADMIN_PASSWORD).digest("hex");
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "replace-this-session-secret";

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
  }
}

const MemorySessionStore = MemoryStore(session);

export const setupAuth = (app: Express) => {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MemorySessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  app.post("/api/admin/login", loginRateLimit, (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    if (username !== ADMIN_USERNAME) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const passwordHash = createHash("sha256").update(password).digest("hex");
    if (passwordHash !== ADMIN_PASSWORD_HASH) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    req.session.isAuthenticated = true;
    req.session.username = username;
    return res.json({ success: true });
  });

  app.post("/api/admin/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, message: "Logout failed" });
      }
      res.clearCookie("connect.sid");
      return res.json({ success: true });
    });
  });

  app.get("/api/admin/status", (req: Request, res: Response) => {
    if (req.session.isAuthenticated) {
      return res.json({
        isAuthenticated: true,
        username: req.session.username,
      });
    }
    return res.json({ isAuthenticated: false });
  });
};

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.session.isAuthenticated) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
