// lib/favorites.ts
import { getCookieJSON, setCookieJSON, COOKIE_KEYS } from "./cookies";

const BUS_EVENT = "favorites:changed";
const STORAGE_PING = "favorites:ping";

export type FavoriteItem = {
  id: string;
  name?: string;
  nameRu?: string;
  image?: string;
  imageUrl?: string;
  price?: number;
  currency?: string;
  oldPrice?: number;
  discountPercent?: number;
  rating?: number;
  pQuantity?: number;
  sold?: number;
  attributes?: string[];
  [k: string]: any;
};

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUS_EVENT));
    try {
      // Still use localStorage for ping to sync tabs
      localStorage.setItem(STORAGE_PING, String(Date.now()));
    } catch {}
  }
}

function cleanAttributes(input: unknown): string[] {
  const arr = Array.isArray(input) ? input : [];
  return Array.from(
    new Set(
      arr
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    )
  ).slice(0, 8);
}

function normalizeItem(raw: FavoriteItem): FavoriteItem {
  const img = raw.imageUrl || raw.image;
  return {
    ...raw,
    image: img,
    imageUrl: img,
    attributes: cleanAttributes(raw.attributes),
  };
}

function mergePreferNew(oldI: FavoriteItem, newI: FavoriteItem): FavoriteItem {
  const merged: FavoriteItem = {
    ...oldI,
    ...newI,
  };
  merged.attributes = cleanAttributes([
    ...(Array.isArray(oldI.attributes) ? oldI.attributes : []),
    ...(Array.isArray(newI.attributes) ? newI.attributes : []),
  ]);
  const img = newI.imageUrl || newI.image || oldI.imageUrl || oldI.image;
  merged.image = img;
  merged.imageUrl = img;
  return normalizeItem(merged);
}

export function getAllFavorites(): FavoriteItem[] {
  if (typeof window === "undefined") return [];
  const data = getCookieJSON<FavoriteItem[]>(COOKIE_KEYS.FAVORITES);
  const normalized = Array.isArray(data) ? data.map(normalizeItem) : [];
  try {
    setCookieJSON(COOKIE_KEYS.FAVORITES, normalized, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  } catch {}
  return normalized;
}

export function saveAllFavorites(items: FavoriteItem[]) {
  if (typeof window === "undefined") return;
  const cleaned = items.map(normalizeItem);
  setCookieJSON(COOKIE_KEYS.FAVORITES, cleaned, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  emitChange();
}

export function hasFavorite(id: string): boolean {
  if (!id) return false;
  return getAllFavorites().some((x) => x.id === id);
}
export function upsertFavorite(item: FavoriteItem) {
  if (!item?.id) return;
  const list = getAllFavorites();
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) {
    list.push(normalizeItem(item));
  } else {
    list[idx] = mergePreferNew(list[idx], item);
  }
  saveAllFavorites(list);
}

export function addFavorite(item: FavoriteItem) {
  // backward compat — endi upsert ishlatamiz
  upsertFavorite(item);
}

export function removeFavorite(id: string) {
  if (!id) return;
  const list = getAllFavorites().filter((x) => x.id !== id);
  saveAllFavorites(list);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  if (!item?.id) return false;
  const exists = hasFavorite(item.id);
  if (exists) removeFavorite(item.id);
  else upsertFavorite(item); // add o‘rniga upsert
  return !exists;
}

export function subscribeFavorites(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_PING) cb();
  };
  window.addEventListener(BUS_EVENT as any, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BUS_EVENT as any, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}
