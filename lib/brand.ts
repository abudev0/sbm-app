// lib/brand.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");

export type LangMap = { uz?: string; ru?: string };
export type BrandItem = { _id: string; slug: string; name?: LangMap };

export async function fetchBrandsForFilters(): Promise<BrandItem[]> {
  const res = await fetch(`${API_BASE}/api/brand?limit=1000`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return items
    .map((b) => ({
      _id: String(b._id),
      slug: b.slug,
      name: (b.name || b.title || {}) as LangMap,
    }))
    .filter((b) => !!b.slug);
}
