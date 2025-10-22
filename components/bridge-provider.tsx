"use client";

import { useEffect } from "react";
import { installCartFavoritesBridge } from "@/lib/cart-zustand-bridge";

/**
 * BridgeProvider: clientda mount bo‘lganda lib/* ↔ Zustand mirror’ni ishga tushiradi.
 * Uni Header ichida yoki global app layout’da bitta marta qo‘ying.
 */
export default function BridgeProvider() {
  useEffect(() => {
    const cleanup = installCartFavoritesBridge();
    return cleanup;
  }, []);

  return null;
}