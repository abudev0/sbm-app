const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchCategoriesForSearch(): Promise<Array<{ _id: string; name?: { uz?: string; ru?: string }; slug?: string }>> {
  const res = await fetch(`${API_BASE}/api/category?active=true`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const items = Array.isArray(data?.data) ? data.data : [];
  return items.map((c: any) => ({
    _id: c._id,
    name: c.name || { uz: c.nameUz, ru: c.nameRu },
    slug: c.slug,
  }));
}

export type CategoryItem = {
  _id: string;
  slug: string;
  name?: { uz?: string; ru?: string };
};

export async function fetchCategoriesForFilters(): Promise<CategoryItem[]> {
  const res = await fetch(`${API_BASE}/api/category?limit=1000`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const items: any[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return items
    .map((c) => ({
      _id: String(c._id),
      slug: c.slug,
      name: c.name || c.title || {},
    }))
    .filter((c) => !!c.slug);
}