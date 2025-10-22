const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export type BrandLang = "uz" | "ru";
export type LangMap = { uz?: string; ru?: string };

export type BrandSliderItem = {
  id: string;
  slug: string;
  title: string;   // lang bo‘yicha string (backenddan yoki resolve)
  img: string;
  description: string; // to‘liq URL
  name?: LangMap;  // xom nom obyekt (ixtiyoriy)
};

export type BrandListItem = {
  id: string;
  slug: string;
  title: string;         // string
  description?: string;  // string
  img: string;           // to‘liq URL
  name?: LangMap;
  descriptionAll?: LangMap;
};

function toFullUrl(rel?: string) {
  if (!rel) return "";
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${API_BASE}/${String(rel).replace(/^\/+/, "")}`;
}

function resolveText(map?: LangMap, lang?: BrandLang) {
  if (!map) return "";
  return (lang && map[lang]) || map.uz || map.ru || "";
}

export async function fetchBrandSlider(params: { lang?: BrandLang; limit?: number; featured?: boolean } = {}) {
  const { lang = "uz", limit = 12, featured } = params;
  const qs = new URLSearchParams({ lang, limit: String(limit) });
  if (typeof featured === "boolean") qs.set("featured", String(featured));

  const res = await fetch(`${API_BASE}/api/brand/slider?${qs.toString()}`, { cache: "no-store" });
  
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Brand slider fetch failed: ${res.status} ${body}`.trim());
  }

  const raw = (await res.json()) as Array<{ _id: string; slug: string; title?: string; img: string; name: LangMap, description: LangMap }>;
  return raw.map(b => ({
    id: b._id,
    slug: b.slug,
    title: b.title || resolveText(b.name, lang) || b.slug,
    img: toFullUrl(b.img),
    name: b.name,
    description: resolveText(b.description, lang)
  })) as BrandSliderItem[];
}

export async function fetchBrandsList(params: { lang?: BrandLang } = {}) {
  const { lang = "uz" } = params;
  const qs = new URLSearchParams({ lang });

  const res = await fetch(`${API_BASE}/api/brand?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Brands fetch failed: ${res.status} ${body}`.trim());
  }

  const raw = (await res.json()) as Array<{
    id: string; slug: string; title?: string; description?: LangMap; img: string; name?: LangMap; descriptionAll?: LangMap;
  }>;
  
  return raw.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title || resolveText(b.name, lang) || b.slug,
    description: resolveText(b.description!, lang) || b.description || "",
    img: toFullUrl(b.img),
    name: b.name,
  })) as BrandListItem[];
}

export type BrandCardModel = {
  id: string;
  name: string;
  logoSrc: string;
  description?: string;
  href: string;
};

export type BrandDetail = {
  id: string;
  slug: string;
  title: string;        // lang bo‘yicha string
  description?: string; // lang bo‘yicha string
  img: string;          // to‘liq URL
  // ixtiyoriy: name, descriptionAll kabi xom maydonlar backenddan kelishi mumkin
  [k: string]: any;
};

export type BrandItem = {
  id: string;
  slug: string;
  name: LangMap;            // { uz, ru }
  description?: LangMap;    // { uz, ru }
  img: string;              // to'liq URL (fetch paytida normalizatsiya qilamiz)
  [k: string]: any;
};

export async function fetchBrandBySlug(slug: string): Promise<BrandItem | null> {
  const res = await fetch(`${API_BASE}/api/brand/slug/${slug}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Brand by slug fetch failed: ${res.status} ${body}`.trim());
  }
  const data = await res.json() as BrandItem;
  return { ...data, img: toFullUrl(data.img) };
}