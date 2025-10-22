// lib/api/products.ts
// Backend: CRUD (/api/*)
// Frontend: barcha formatlash/locale ishlarini bu fayl ichida normallashtiramiz

import { getAccessToken } from "./auth";
import { BrandSliderItem, LangMap } from "./brand";

/* =========================
 * Types
 * =======================*/

export interface RawImageObject {
  _id: string;
  img: string;
  product_id: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface RawProduct {
  _id: string;
  slug?: string;
  title?: { uz?: string; ru?: string; en?: string; [k: string]: string | undefined };
  description?: { uz?: string; ru?: string; en?: string; [k: string]: string | undefined };

  price: number;
  discount?: number;            // % (0..100)
  currency?: string;

  attributes?: string[];        // ["1L", "3.2%", ...]
  stock?: number;
  sold?: number;
  special_offer?: boolean;
  is_active?: boolean;
  rating?: number;
  rating_count?: number;

  brand_id: string;
  category_id?: string;         // optional (ObjectId yoki slug bo‘lishi ham mumkin)

  // Virtual populate (ProductImage[])
  images?: RawImageObject[];

  // Legacy fallbacklar:
  image?: string | Array<string | { img?: string; [k: string]: any }>;

  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
}

export interface RawListResponse {
  meta: { page: number; limit: number; total: number; pages: number };
  items: RawProduct[];
}

export type ProductImage = { _id: string; img: string; product_id: string; [k: string]: any };

export type ProductEntity = {
  id: string;
  slug: string;
  name?: LangMap;            // { uz, ru }
  price?: number;
  oldPrice?: number;
  discountPercent?: number;
  images: ProductImage[];   // to‘liq URLlar
  rating?: number;
  sold?: number;
  pQuantity?: number;
  attributes?: string[];
  [k: string]: any;
};

/* =========================
 * Consts & utils
 * =======================*/

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

function toFullUrl(rel?: string) {
  if (!rel) return "";
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${API_BASE}/${String(rel).replace(/^\/+/, "")}`;
}

function parseCsvish(v?: string | string[] | null) {
  if (!v) return [];
  const s = Array.isArray(v) ? v.join(",") : v;
  return Array.from(
    new Set(
      s.split(",")
        .map((x) => x.trim())
        .filter(Boolean)
    )
  );
}

export function isObjectIdLike(v: string) {
  return /^[a-f\d]{24}$/i.test(v);
}

/* =========================
 * Normalizers / helpers
 * =======================*/

export function resolveProductName(p: RawProduct, locale: string) {
  const t = p.title || {};
  return t[locale as keyof typeof t] || t.uz || t.ru || t.en || "";
}

export function resolveProductDescription(p: RawProduct, locale: string) {
  const d = p.description || {};
  return d[locale as keyof typeof d] || d.uz || d.ru || d.en || "";
}

export function computeFinalPrice(price: number, discount?: number) {
  const d = discount && discount > 0 ? discount : 0;
  if (d > 0) {
    const fp = Math.round(price * (1 - d / 100));
    return { finalPrice: fp, oldPrice: price, discountPercent: d };
  }
  return { finalPrice: price, oldPrice: undefined, discountPercent: undefined };
}

export function formatPrice(num: number, _currency?: string) {
  return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")}`;
}

export function extractImages(raw: RawProduct) {
  let images: string[] = [];
  let primary = "";

  if (Array.isArray(raw.images) && raw.images.length) {
    images = raw.images.map((i) => i?.img).filter(Boolean) as string[];
    primary = images[0] || "";
    return { images, primaryImage: primary };
  }

  // Legacy fallback
  const legacy = raw as any;
  if (Array.isArray(legacy.image)) {
    images = legacy.image
      .map((i: any) => (typeof i === "string" ? i : i?.img))
      .filter(Boolean);
    primary = images[0] || "";
  } else if (typeof legacy.image === "string") {
    images = [legacy.image];
    primary = legacy.image;
  }

  return { images, primaryImage: primary };
}

export function extractWeight(attributes?: string[]) {
  if (!Array.isArray(attributes)) return undefined;
  const direct = attributes.find((a) => /^weight\s*[:=-]/i.test(a));
  if (direct) return direct.replace(/^weight\s*[:=-]\s*/i, "").trim();
  const weightRegex = /\b(\d+(\.\d+)?)(\s?)(ml|l|g|kg|гр|кг|мм|cm|см|%)\b/i;
  for (const a of attributes) {
    const m = a.match(weightRegex);
    if (m) return m[0];
  }
  return undefined;
}

/** Backwards-compat: eski UI’da ishlatilgan bo‘lishi mumkin */
export function sortProducts(raw: RawProduct[], sort: string) {
  switch (sort) {
    case "new":
      return [...raw].sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    case "rating":
      return [...raw].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case "sale":
      return [...raw].sort((a, b) => (b.discount || 0) - (a.discount || 0));
    case "liked":
      return raw;
    default:
      return raw;
  }
}

/** Backwards-compat: eski client-side filtrlar (hozir backend filterlaydi) */
export function filterProductsClient(
  raw: RawProduct[],
  opts: {
    search?: string;
    brandKeys?: string[];
    categoryKeys?: string[];
    minPrice?: number;
    maxPrice?: number;
    locale: string;
  }
) {
  let out = raw;

  if (opts.search) {
    const q = opts.search.toLowerCase();
    out = out.filter(
      (p) =>
        resolveProductName(p, opts.locale).toLowerCase().includes(q) ||
        resolveProductDescription(p, opts.locale).toLowerCase().includes(q)
    );
  }

  if (opts.brandKeys && opts.brandKeys.length) {
    out = out.filter((p) => opts.brandKeys!.includes((p as any)?.brand_id?.slug || ""));
  }

  if (opts.categoryKeys && opts.categoryKeys.length) {
    out = out.filter((p) => opts.categoryKeys!.includes((p as any)?.category_id as any));
  }

  if (opts.minPrice || opts.maxPrice) {
    out = out.filter((p) => {
      const price = p.price || 0;
      return (
        (!opts.minPrice || price >= opts.minPrice) &&
        (!opts.maxPrice || price <= opts.maxPrice)
      );
    });
  }

  return out;
}

function normalizeName(raw: any): LangMap {
  if (raw && typeof raw === "object" && ("uz" in raw || "ru" in raw)) return { uz: raw.uz, ru: raw.ru };
  if (raw && typeof raw === "object" && "title" in raw && typeof raw.title === "object")
    return { uz: (raw as any).title.uz, ru: (raw as any).title.ru };
  if (raw && typeof raw === "object") {
    const uz = (raw as any).nameUz ?? (raw as any).titleUz ?? (raw as any).uz;
    const ru = (raw as any).nameRu ?? (raw as any).titleRu ?? (raw as any).ru;
    if (uz || ru) return { uz, ru };
  }
  if (typeof raw === "string") return { uz: raw, ru: raw };
  if (raw && typeof raw === "object" && typeof (raw as any).title === "string")
    return { uz: (raw as any).title, ru: (raw as any).title };
  return {};
}

function normalizeAttributes(raw: any): string[] {
  const out: string[] = [];
  const sources = [raw?.attributes, raw?.characteristics, raw?.specs, raw?.props, raw?.properties];
  for (const base of sources) {
    if (!base) continue;
    if (Array.isArray(base)) {
      for (const it of base) {
        if (!it) continue;
        if (typeof it === "string") out.push(it);
        else if (typeof it === "object") {
          const v =
            (it as any).value ??
            (it as any).val ??
            (it as any).v ??
            (it as any).text ??
            (it as any).name ??
            (it as any).label;
          if (typeof v === "string") out.push(v);
          else if (typeof v === "number") out.push(String(v));
        }
      }
    } else if (typeof base === "object") {
      for (const [, v] of Object.entries(base)) {
        if (v == null) continue;
        if (typeof v === "string" || typeof v === "number") out.push(String(v));
        else if (typeof v === "object") {
          const vv = (v as any).value ?? (v as any).label ?? (v as any).name;
          if (typeof vv === "string") out.push(vv);
          else if (typeof vv === "number") out.push(String(vv));
        }
      }
    }
  }
  return Array.from(new Set(out.map((s) => s?.trim()).filter(Boolean)));
}

/* =========================
 * API calls
 * =======================*/

/**
 * GET /api/product
 * Backend paramlari bilan 100% mos: brand, category, search, minPrice, maxPrice, sort, hasDiscount, page, limit
 * brand/category CSV (multi-select) ham qo‘llanadi.
 */
export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
  brand?: string | string[];      // slug | ObjectId | CSV/array
  category?: string | string[];   // id | slug | CSV/array
  hasDiscount?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "discount" | "price_asc" | "price_desc" | "sold";
} = {}): Promise<RawListResponse> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  if (params.search) qs.set("search", params.search);

  const brandCsv = parseCsvish(params.brand as any);
  const catCsv = parseCsvish(params.category as any);
  if (brandCsv.length) qs.set("brand", brandCsv.join(","));
  if (catCsv.length) qs.set("category", catCsv.join(","));

  if (typeof params.hasDiscount === "boolean") qs.set("hasDiscount", String(params.hasDiscount));
  if (typeof params.minPrice === "number") qs.set("minPrice", String(params.minPrice));
  if (typeof params.maxPrice === "number") qs.set("maxPrice", String(params.maxPrice));
  if (params.sort) qs.set("sort", params.sort);
  
  const url = `${API_BASE}/api/product?${qs.toString()}`;
  

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Products fetch failed: ${res.status} ${body}`.trim());
  }
  return (await res.json()) as RawListResponse;
}

export async function fetchProductById(id: string): Promise<RawProduct | null> {
  const url = `${API_BASE}/api/product/${id}`;
  const res = await fetch(url, { cache: "no-store" });

  if (res.status === 404) return null;
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Product by id fetch failed: ${res.status} ${body}`.trim());
  }
  return (await res.json()) as RawProduct;
}

/**
 * Slug bo‘yicha topish (fallback): sahifalab yurib qidiradi.
 * Backendda alohida slug endpoint yo‘q bo‘lsa ishlatamiz.
 */
export async function fetchProductBySlugFallback(slug: string): Promise<RawProduct | null> {
  const first = await fetchProducts({ page: 1, limit: 100 });
  let found = first.items.find((p) => (p.slug || p._id) === slug);
  if (found) return found;

  for (let p = 2; p <= first.meta.pages; p++) {
    const pageResp = await fetchProducts({ page: p, limit: 100 });
    found = pageResp.items.find((it) => (it.slug || it._id) === slug);
    if (found) return found;
  }
  return null;
}

/** Qidiruv bar uchun mini API (suggestion) */
export async function searchProducts(params: {
  q?: string;
  category?: string;   // slug yoki id
  page?: number;
  limit?: number;
} = {}) {
  const { q, category, page = 1, limit = 24 } = params;
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (q) qs.set("search", q);
  if (category) qs.set("category", category);

  const res = await fetch(`${API_BASE}/api/product?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) return { items: [], meta: null as any };

  const data = await res.json();
  const items = Array.isArray(data?.items) ? data.items : [];
  return { items, meta: data.meta || null };
}

/** Brand bo‘yicha: front uchun oddiyroq shaklga map */
export async function fetchProductsByBrand(params: {
  brand: string; // slug yoki ObjectId, CSV ham bo‘lishi mumkin
  page?: number;
  limit?: number;
}): Promise<ProductEntity[]> {
  const { brand, page = 1, limit = 12 } = params;

  const qs = new URLSearchParams({
    brand,
    page: String(page),
    limit: String(limit),
  });

  const res = await fetch(`${API_BASE}/api/product?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new Error(`Products by brand fetch failed: ${res.status} ${body}`.trim());
  }

  const data = (await res.json()) as { items?: any[] } | any[];
  const items = Array.isArray(data) ? data : Array.isArray(data.items) ? data.items : [];

  return items.map((p: any) => {
    const img =
      p.primaryImage ||
      (Array.isArray(p.images) && (p.images[0]?.img || p.images[0])) ||
      (Array.isArray(p.image) ? p.image[0] : p.image) ||
      p.img ||
      "";

    const name = normalizeName(p.name ?? p.title ?? { nameUz: p.nameUz, nameRu: p.nameRu });

    return {
      id: String(p._id || p.id),
      slug: p.slug || String(p._id || ""),
      name,
      price: typeof p.price === "number" ? p.price : Number(p.price ?? 0),
      oldPrice:
        typeof p.oldPrice === "number"
          ? p.oldPrice
          : p.oldPrice != null
          ? Number(p.oldPrice)
          : undefined,
      discountPercent:
        typeof p.discountPercent === "number"
          ? p.discountPercent
          : typeof p.discount === "number"
          ? p.discount
          : undefined,
      images: img ? [{ _id: "0", img: toFullUrl(img), product_id: String(p._id || p.id) }] : [],
      rating: p.rating ?? 0,
      sold: p.sold,
      pQuantity: p.pQuantity ?? p.stock,
      attributes: normalizeAttributes(p),
    } as ProductEntity;
  });
}

/** Bulk by ids (optional) */
export async function fetchProductsByIds(ids: string[]): Promise<ProductEntity[]> {
  if (!ids.length) return [];
  const qs = new URLSearchParams();
  qs.set("ids", ids.join(","));
  const res = await fetch(`${API_BASE}/api/product?${qs.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Products fetch failed");
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}
