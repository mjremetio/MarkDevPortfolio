# Admin / CMS security

The admin console (`/maglogin` → `/admin`) is protected by a hardened, stateless
authentication layer (`server/auth.ts`).

## How it works

- **Stateless signed sessions.** On login the server issues an HMAC-SHA256 signed
  token stored in an `HttpOnly; SameSite=Strict; Secure` cookie (`mdp_admin`,
  12-hour expiry). There is no server-side session store, so it works across
  Vercel serverless invocations and survives redeploys (as long as
  `SESSION_SECRET` is stable). Tampered or expired tokens are rejected.
- **Password hashing.** Passwords are verified with **scrypt** and a constant-time
  comparison — no reversible/fast hashes.
- **Fail closed.** In production, login is **disabled** until credentials and a
  session secret are configured. The old `admin` / `password123` default does not
  work in production.
- **Rate limiting.** 8 failed attempts per IP per 15 minutes → `429` with a
  `Retry-After` header. A successful login resets the counter.
- **Optional 2FA (TOTP).** Set `ADMIN_TOTP_SECRET` to require a 6-digit
  authenticator code (RFC 6238, compatible with Google Authenticator / 1Password).

## Required environment variables (set these in Vercel → Settings → Environment Variables)

| Variable | Required | Notes |
| --- | --- | --- |
| `SESSION_SECRET` | **Yes** (prod) | Random 32+ byte hex string. Keep it stable — changing it logs everyone out. |
| `ADMIN_PASSWORD_HASH` | Yes* | scrypt hash from the CLI below (preferred). |
| `ADMIN_PASSWORD` | Yes* | Plaintext password (fallback if you don't set a hash). |
| `ADMIN_USERNAME` | No | Defaults to `admin`. |
| `ADMIN_TOTP_SECRET` | No | base32 secret to enable 2FA. |

\* Set **either** `ADMIN_PASSWORD_HASH` (recommended) **or** `ADMIN_PASSWORD`.

## Generate credentials

```bash
npm run hash-password -- 'your-strong-passphrase'
```

This prints an `ADMIN_PASSWORD_HASH` value (`scrypt$<salt>$<hash>`) and a suggested
`SESSION_SECRET`. Copy them into your host's environment variables and redeploy.
Never commit these values.

## Enable 2FA (optional)

1. Generate a base32 secret (e.g. from your authenticator app, or
   `node -e "console.log(require('crypto').randomBytes(20).toString('base64').replace(/[^A-Z2-7]/gi,'').slice(0,32).toUpperCase())"`).
2. Add it to your authenticator app as a manual/base32 key (issuer: Mark Remetio).
3. Set `ADMIN_TOTP_SECRET` to that secret and redeploy. The login page will then
   ask for the 6-digit code.
