#!/usr/bin/env node
/**
 * Generate a scrypt password hash for ADMIN_PASSWORD_HASH.
 *
 *   node scripts/hash-password.mjs 'your-strong-password'
 *   npm run hash-password -- 'your-strong-password'
 *
 * Prints a value of the form  scrypt$<saltHex>$<hashHex>  — set it as the
 * ADMIN_PASSWORD_HASH environment variable (e.g. in Vercel). Also prints a
 * fresh SESSION_SECRET you can use.
 */
import { scryptSync, randomBytes } from "crypto";

const password = process.argv[2];
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs '<password>'");
  process.exit(1);
}
if (password.length < 12) {
  console.error(
    `\n⚠️  That password is only ${password.length} characters. Use at least 12 (a passphrase is ideal).\n`,
  );
}

const salt = randomBytes(16);
const hash = scryptSync(password, salt, 32);
const value = `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;

console.log("\nADMIN_PASSWORD_HASH:");
console.log(value);
console.log("\nSuggested SESSION_SECRET (random, keep stable across deploys):");
console.log(randomBytes(32).toString("hex"));
console.log(
  "\nSet these in your host (Vercel → Project → Settings → Environment Variables),",
);
console.log("then redeploy. Do NOT commit them.\n");
