/**
 * Lightweight env helper: do not crash the app when optional env vars are missing.
 * - For API_INTERNAL_URL we prefer process.env.API_INTERNAL_URL, fallback to NEXT_PUBLIC_API_URL.
 * - We warn once on startup when required values are missing.
 */

type EnvShape = {
  API_INTERNAL_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_SITE_URL?: string;
  BOT_TOKEN?: string;
};

const rawEnv: EnvShape = {
  API_INTERNAL_URL: process.env.API_INTERNAL_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  BOT_TOKEN: process.env.BOT_TOKEN,
};

function warnOnce(key: string, msg: string) {
  if (!(global as any).__env_warned__) (global as any).__env_warned__ = {};
  if ((global as any).__env_warned__[key]) return;
  (global as any).__env_warned__[key] = true;
  // eslint-disable-next-line no-console
  console.warn(`[env] ${msg}`);
}

export const NEXT_PUBLIC_API_URL = rawEnv.NEXT_PUBLIC_API_URL || "";
export const NEXT_PUBLIC_SITE_URL = rawEnv.NEXT_PUBLIC_SITE_URL || "";
export const BOT_TOKEN = rawEnv.BOT_TOKEN || "";

/**
 * API_INTERNAL_URL: used for server-to-server/internal calls.
 * Fallback to NEXT_PUBLIC_API_URL when not provided (common in simple setups).
 * Do NOT throw here to avoid runtime crashes; instead warn so dev can fix .env.
 */
export const API_INTERNAL_URL =
  rawEnv.API_INTERNAL_URL || rawEnv.NEXT_PUBLIC_API_URL || "";

if (!API_INTERNAL_URL) {
  warnOnce(
    "API_INTERNAL_URL",
    "Missing API_INTERNAL_URL and NEXT_PUBLIC_API_URL; some features may not work. Set API_INTERNAL_URL in your environment."
  );
}
if (!BOT_TOKEN) {
  warnOnce("BOT_TOKEN", "Missing BOT_TOKEN env var; Telegram bot functionality will be disabled.");
}
if (!NEXT_PUBLIC_SITE_URL) {
  warnOnce(
    "NEXT_PUBLIC_SITE_URL",
    "Missing NEXT_PUBLIC_SITE_URL env var; web app links may be incorrect."
  );
}

// add this helper used by axios and other modules
export function buildServerBase(): string {
  const base = API_INTERNAL_URL || NEXT_PUBLIC_API_URL || "";
  return String(base).replace(/\/+$/, "");
}

export function buildClientBase(): string {
  const base = NEXT_PUBLIC_API_URL || "";
  return String(base).replace(/\/+$/, "");
}