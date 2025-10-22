import createMiddleware from "next-intl/middleware";
import { NextResponse, NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const SUPPORTED_LOCALES = ["uz", "ru"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

function parseAcceptLanguage(header: string | null): Locale | undefined {
  if (!header) return undefined;
  // Simple parser: take first language tag and normalize to supported locales
  const parts = header.split(",").map((p) => p.split(";")[0].trim().toLowerCase());
  for (const p of parts) {
    if (p.startsWith("uz")) return "uz";
    if (p.startsWith("ru")) return "ru";
    // allow "uz-latn", "uz-cyrl" etc.
  }
  return undefined;
}

export default function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Do not touch API routes or next internals
  // -------------------------
  // Important: we want the API to remain usable without being redirected
  // to /uz/api or /ru/api. So bypass middleware for `api` first segment.
  const firstSegment = pathname.split("/")[1] ?? "";

  if (firstSegment === "api") {
    // Let API requests pass through untouched
    return NextResponse.next();
  }

  // If the path already has a supported locale prefix -> let next-intl handle it
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return intlMiddleware(req);
  }

  // Choose language from cookie, fallback to accept-language, fallback to "uz"
  const cookieLang = req.cookies.get("language")?.value;
  const langFromCookie = cookieLang && SUPPORTED_LOCALES.includes(cookieLang as Locale) ? (cookieLang as Locale) : undefined;

  const acceptLang = parseAcceptLanguage(req.headers.get("accept-language"));
  const targetLang = langFromCookie ?? acceptLang ?? "uz";

  // Build redirect URL preserving pathname and search
  // If user requested "/", it will redirect to "/{lang}/"
  const redirectUrl = new URL(req.url);
  // Avoid duplicate slashes
  redirectUrl.pathname = `/${targetLang}${pathname}`;

  return NextResponse.redirect(redirectUrl);
}

/**
 * Only run this middleware for site pages (not for `_next` internals or static files),
 * and explicitly exclude `api` so API endpoints are not redirected.
 */
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};