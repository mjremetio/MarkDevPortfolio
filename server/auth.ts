import {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { createHash } from "crypto";
import { eq } from "drizzle-orm";
import { admins } from "@shared/schema";
import { db, connectionPool } from "./db";

const DEFAULT_ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const DEFAULT_ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ?? "password123";
const DEFAULT_ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ??
  createHash("sha256").update(DEFAULT_ADMIN_PASSWORD).digest("hex");
const SESSION_SECRET =
  process.env.SESSION_SECRET ?? "replace-this-session-secret";
const PgStore = connectPgSimple(session);

let seedPromise: Promise<void> | null = null;

const ensureDefaultAdmin = () => {
  if (!seedPromise) {
    seedPromise = (async () => {
      const [existing] = await db
        .select({ id: admins.id })
        .from(admins)
        .where(eq(admins.username, DEFAULT_ADMIN_USERNAME));

      if (!existing) {
        await db
          .insert(admins)
          .values({
            username: DEFAULT_ADMIN_USERNAME,
            passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
          })
          .onConflictDoNothing();
      }
    })();
  }

  return seedPromise;
};

declare module "express-session" {
  interface SessionData {
    isAuthenticated?: boolean;
    username?: string;
  }
}

export const setupAuth = (app: Express) => {
  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new PgStore({
        pool: connectionPool,
        createTableIfMissing: true,
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      },
    }),
  );

  void ensureDefaultAdmin().catch((error) => {
    console.error("Failed to seed default admin:", error);
  });

  app.post("/api/admin/login", async (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    await ensureDefaultAdmin();

    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username));

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const passwordHash = createHash("sha256").update(password).digest("hex");
    if (passwordHash !== admin.passwordHash) {
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
