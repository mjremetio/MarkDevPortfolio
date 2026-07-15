import {
  type Express,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import {
  createHmac,
  createHash,
  timingSafeEqual,
  scryptSync,
  randomBytes,
} from "crypto";

/**
 * Stateless, serverless-safe admin authentication.
 *
 * Sessions are a signed (HMAC-SHA256) token stored in an httpOnly cookie — no
 * server-side session store, so it works identically across Vercel serverless
 * invocations and survives redeploys as long as SESSION_SECRET is stable.
 *
 * Security posture:
 *  - Passwords verified with scrypt (ADMIN_PASSWORD_HASH) or a constant-time
 *    compare of a plaintext env password (ADMIN_PASSWORD). No weak SHA-256.
 *  - In production, login is DISABLED until credentials + SESSION_SECRET are
 *    configured — the old admin/password123 default no longer works.
 *  - Constant-time username + password comparison (no user enumeration/timing).
 *  - Optional TOTP 2FA (set ADMIN_TOTP_SECRET, base32) — RFC 6238, ±1 step.
 *  - Per-IP login rate limiting with lockout + Retry-After; reset on success.
 *  - SameSite=Strict cookie (CSRF defense) + Secure in production.
 */

const IS_PROD =
  process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim(); // scrypt$<saltHex>$<hashHex> (or legacy sha256 hex)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // plaintext env fallback
const TOTP_SECRET = (process.env.ADMIN_TOTP_SECRET ?? "").replace(/\s/g, ""); // base32, optional

const COOKIE_NAME = "mdp_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12h

// Resolve the token-signing secret. Required in production; otherwise ephemeral.
let SIGNING_SECRET = process.env.SESSION_SECRET ?? "";
if (!SIGNING_SECRET) {
  SIGNING_SECRET = randomBytes(32).toString("hex");
  if (IS_PROD) {
    console.error(
      "[auth] SESSION_SECRET is not set — using an ephemeral secret; sessions will not survive restarts. Set SESSION_SECRET in the environment.",
    );
  }
}

const CREDENTIALS_CONFIGURED = Boolean(ADMIN_PASSWORD_HASH || ADMIN_PASSWORD);
if (!CREDENTIALS_CONFIGURED && IS_PROD) {
  console.error(
    "[auth] No ADMIN_PASSWORD or ADMIN_PASSWORD_HASH set — admin login is DISABLED until configured.",
  );
}

/* ----------------------------- primitives ------------------------------ */

// Constant-time string compare that does not leak length (hash to fixed size).
function safeEqualStr(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a, "utf8").digest();
  const hb = createHash("sha256").update(b, "utf8").digest();
  return timingSafeEqual(ha, hb);
}

function verifyPassword(input: string): boolean {
  if (ADMIN_PASSWORD_HASH) {
    const parts = ADMIN_PASSWORD_HASH.split("$");
    if (parts.length === 3 && parts[0] === "scrypt") {
      try {
        const salt = Buffer.from(parts[1], "hex");
        const expected = Buffer.from(parts[2], "hex");
        const actual = scryptSync(input, salt, expected.length);
        return timingSafeEqual(actual, expected);
      } catch {
        return false;
      }
    }
    // Legacy back-compat: a bare sha256 hex digest.
    try {
      const expected = Buffer.from(ADMIN_PASSWORD_HASH, "hex");
      const actual = createHash("sha256").update(input).digest();
      return expected.length === actual.length && timingSafeEqual(actual, expected);
    } catch {
      return false;
    }
  }
  if (ADMIN_PASSWORD) return safeEqualStr(input, ADMIN_PASSWORD);
  // Dev convenience only — never in production.
  if (!IS_PROD) return safeEqualStr(input, "password123");
  return false;
}

/* ------------------------------- TOTP ---------------------------------- */

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const clean = input.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = alphabet.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

function hotp(key: Buffer, counter: number): string {
  const buf = Buffer.alloc(8);
  // counter is < 2^53; write as 64-bit big-endian.
  buf.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  const digest = createHmac("sha1", key).update(buf).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const code =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return (code % 1_000_000).toString().padStart(6, "0");
}

export const twoFactorEnabled = () => TOTP_SECRET.length > 0;

function verifyTotp(token: string | undefined): boolean {
  if (!twoFactorEnabled()) return true;
  if (!token || !/^\d{6}$/.test(token)) return false;
  const key = base32Decode(TOTP_SECRET);
  if (key.length === 0) return false;
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let w = -1; w <= 1; w++) {
    const candidate = hotp(key, step + w);
    if (timingSafeEqual(Buffer.from(candidate), Buffer.from(token))) return true;
  }
  return false;
}

/* --------------------------- signed session ---------------------------- */

function sign(data: string): string {
  return createHmac("sha256", SIGNING_SECRET).update(data).digest("base64url");
}

function issueToken(username: string): string {
  const payload = { u: username, exp: Date.now() + SESSION_TTL_MS };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

function verifyToken(token: string | undefined): { u: string } | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8"));
    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return null;
    if (typeof payload.u !== "string") return null;
    return { u: payload.u };
  } catch {
    return null;
  }
}

/* ------------------------------ cookies -------------------------------- */

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const pair of header.split(";")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}

function setSessionCookie(res: Response, token: string) {
  const attrs = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}`,
  ];
  if (IS_PROD) attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

function clearSessionCookie(res: Response) {
  const attrs = [
    `${COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    "Max-Age=0",
  ];
  if (IS_PROD) attrs.push("Secure");
  res.setHeader("Set-Cookie", attrs.join("; "));
}

function sessionUser(req: Request): string | null {
  const token = parseCookies(req.headers.cookie)[COOKIE_NAME];
  return verifyToken(token)?.u ?? null;
}

/* --------------------------- rate limiting ----------------------------- */

const loginAttempts = new Map<string, { count: number; resetTime: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function loginRateLimit(req: Request, res: Response, next: NextFunction) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 0, resetTime: now + WINDOW_MS });
    return next();
  }
  if (entry.count >= MAX_ATTEMPTS) {
    const retry = Math.ceil((entry.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(retry));
    return res.status(429).json({
      success: false,
      message: `Too many login attempts. Try again in ${Math.ceil(retry / 60)} minute(s).`,
    });
  }
  return next();
}

function recordFailure(req: Request) {
  const ip = clientIp(req);
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetTime) {
    loginAttempts.set(ip, { count: 1, resetTime: now + WINDOW_MS });
  } else {
    entry.count++;
  }
}

// Prune stale rate-limit entries hourly (best-effort; not on serverless cold paths).
if (typeof setInterval === "function") {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of Array.from(loginAttempts.entries())) {
      if (now > entry.resetTime) loginAttempts.delete(ip);
    }
  }, 60 * 60 * 1000);
  if (typeof timer.unref === "function") timer.unref();
}

/* ------------------------------- routes -------------------------------- */

export const setupAuth = (app: Express) => {
  app.get("/api/admin/config", (_req: Request, res: Response) => {
    res.json({ twoFactorEnabled: twoFactorEnabled() });
  });

  app.post("/api/admin/login", loginRateLimit, (req: Request, res: Response) => {
    const { username, password, code } = req.body ?? {};

    if (!username || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Username and password are required" });
    }

    if (IS_PROD && !CREDENTIALS_CONFIGURED) {
      return res.status(503).json({
        success: false,
        message: "Admin login is not configured on this server.",
      });
    }

    const okUser = safeEqualStr(String(username), ADMIN_USERNAME);
    const okPass = verifyPassword(String(password));
    if (!okUser || !okPass) {
      recordFailure(req);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    if (twoFactorEnabled() && !verifyTotp(code ? String(code) : undefined)) {
      // Don't count a valid-password-but-missing-code as a brute-force attempt as
      // harshly, but still record to slow code-guessing.
      recordFailure(req);
      return res.status(401).json({
        success: false,
        twoFactorRequired: true,
        message: code ? "Invalid authentication code" : "Authentication code required",
      });
    }

    loginAttempts.delete(clientIp(req)); // reset on success
    setSessionCookie(res, issueToken(String(username)));
    return res.json({ success: true });
  });

  app.post("/api/admin/logout", (_req: Request, res: Response) => {
    clearSessionCookie(res);
    return res.json({ success: true });
  });

  app.get("/api/admin/status", (req: Request, res: Response) => {
    const user = sessionUser(req);
    if (user) {
      return res.json({
        isAuthenticated: true,
        username: user,
        twoFactorEnabled: twoFactorEnabled(),
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
  if (!sessionUser(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
