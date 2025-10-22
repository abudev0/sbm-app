"use client";

import { useEffect } from "react";
import { getCookie, setCookie, COOKIE_KEYS } from "@/lib/cookies";

export function LanguageInitializer() {
  useEffect(() => {
    const supported = ["uz", "ru"];
    const lang = getCookie(COOKIE_KEYS.LANGUAGE);

    if (!lang || !supported.includes(lang)) {
      setCookie(COOKIE_KEYS.LANGUAGE, "uz", {
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
  }, []);

  return null;
}
