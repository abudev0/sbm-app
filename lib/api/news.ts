import { serverAxios } from "./axios";
import { clientAxios } from "./axios";

export interface Localized {
  uz: string; ru: string; en: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  image: string;
  title: string | Localized;
  description: string | Localized;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  _allTitle?: Localized;
  _allDescription?: Localized;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

// SSR uchun
export async function getNews(lang: "uz"|"ru"|"en", limit?: number) {
  try {
    const { data } = await serverAxios.get<NewsItem[]>("/api/news", {
      params: { lang, ...(limit ? { limit } : {}) },
    });
    return data;
  } catch (err) {
    // fallback to raw fetch (be defensive and return an empty array on failure)
    try {
      const qs = new URLSearchParams({ lang });
      if (limit) qs.set("limit", String(limit));
      const res = await fetch(`${API_BASE}/api/news?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) return [];
      const json = await res.json().catch(() => null);
      // backend might return { data: [...] } or an array directly
      if (Array.isArray(json)) return json as NewsItem[];
      if (json && Array.isArray((json as any).data)) return (json as any).data as NewsItem[];
      return [];
    } catch (e) {
      console.warn("getNews fallback failed", e);
      return [];
    }
  }
}

// Detail
export async function getNewsBySlug(slug: string, lang: "uz"|"ru"|"en") {
  try {
    const { data } = await serverAxios.get<NewsItem>(`/api/news/slug/${slug}`, {
      params: { lang },
    });
    return data;
  } catch (err) {
    try {
      const qs = new URLSearchParams({ lang });
      const res = await fetch(`${API_BASE}/api/news/slug/${encodeURIComponent(slug)}?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) return null;
      const json = await res.json().catch(() => null);
      // backend might return { data: item } or the item directly
      if (!json) return null;
      if (json && json._id) return json as NewsItem;
      if (json.data && json.data._id) return json.data as NewsItem;
      return null;
    } catch (e) {
      console.warn("getNewsBySlug fallback failed", e);
      return null;
    }
  }
}

// Client tarafdan pagination yoki dynamic load
export async function fetchNewsClient(lang: string, limit?: number) {
  try {
    const { data } = await clientAxios.get<NewsItem[]>("/api/news", {
      params: { lang, ...(limit ? { limit } : {}) },
    });
    return data;
  } catch (err) {
    try {
      const qs = new URLSearchParams({ lang });
      if (limit) qs.set("limit", String(limit));
      const res = await fetch(`/api/news?${qs.toString()}`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json().catch(() => null);
      if (Array.isArray(json)) return json as NewsItem[];
      if (json && Array.isArray((json as any).data)) return (json as any).data as NewsItem[];
      return [];
    } catch (e) {
      console.warn("fetchNewsClient fallback failed", e);
      return [];
    }
  }
}