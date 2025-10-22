/**
 * Universal cookie helper that works on both server and client side
 * For Next.js SSR/SSG compatibility
 */

// Cookie keys
export const COOKIE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  LANGUAGE: "language",
  CART: "cart",
  FAVORITES: "favorites",
  LAST_ORDER: "last_order_snapshot",
} as const;

// Cookie options
const COOKIE_OPTIONS = {
  path: "/",
  maxAge: 60 * 60 * 24 * 365, // 1 year
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

/**
 * Set a cookie (client-side only)
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    maxAge?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
  } = {}
): void {
  if (typeof window === "undefined") return;

  const opts = { ...COOKIE_OPTIONS, ...options };
  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (opts.maxAge) {
    cookieString += `; max-age=${opts.maxAge}`;
  }
  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }
  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }
  if (opts.secure) {
    cookieString += "; secure";
  }
  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Get a cookie value (works on both server and client)
 */
export function getCookie(name: string, cookieHeader?: string): string | null {
  // Server-side: use cookie header
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader);
    return cookies[name] || null;
  }

  // Client-side: use document.cookie
  if (typeof window === "undefined") return null;

  const cookies = parseCookies(document.cookie);
  return cookies[name] || null;
}

/**
 * Parse cookie string into object
 */
function parseCookies(cookieString: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieString) return cookies;

  cookieString.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.split("=");
    const value = rest.join("=");
    if (name && value) {
      cookies[decodeURIComponent(name.trim())] = decodeURIComponent(value.trim());
    }
  });

  return cookies;
}

/**
 * Remove a cookie
 */
export function removeCookie(name: string, options: { path?: string; domain?: string } = {}): void {
  if (typeof window === "undefined") return;

  const opts = { ...COOKIE_OPTIONS, ...options, maxAge: -1 };
  setCookie(name, "", opts);
}

/**
 * Get all cookies as object (client-side only)
 */
export function getAllCookies(): Record<string, string> {
  if (typeof window === "undefined") return {};
  return parseCookies(document.cookie);
}

/**
 * Helper to safely parse JSON from cookie
 */
export function getCookieJSON<T = any>(name: string, cookieHeader?: string): T | null {
  const value = getCookie(name, cookieHeader);
  if (!value) return null;

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

/**
 * Helper to set JSON value in cookie
 */
export function setCookieJSON(name: string, value: any, options = {}): void {
  try {
    const jsonString = JSON.stringify(value);
    setCookie(name, jsonString, options);
  } catch (error) {
    console.error(`Failed to set cookie ${name}:`, error);
  }
}
