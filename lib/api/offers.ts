const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '').replace(/\/+$/, '');

export type LocaleText = { uz?: string; ru?: string };
export type OfferEntity = {
  id: string;
  title: LocaleText;
  href: string;
  bgImage: string; // absolute URL
  order?: number;
  active?: boolean;
};

function toFullUrl(rel?: string) {
  if (!rel) return '';
  if (/^https?:\/\//i.test(rel)) return rel;
  return `${API_BASE}/${String(rel).replace(/^\/+/, '')}`;
}
export async function fetchOffers(params: { page?: number; limit?: number; active?: boolean } = {}) {
  const { page = 1, limit = 12, active = true } = params;
  const qs = new URLSearchParams({ page: String(page), limit: String(limit), active: String(active) });
  const res = await fetch(`${API_BASE}/api/offer?${qs.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Offer fetch failed");
  const data = await res.json();
  const items = Array.isArray(data.items) ? data.items : [];
  return items.map((o: any) => ({
    id: o._id || o.id,
    title: o.title,
    slug: o.slug,
    bgImage: toFullUrl(o.bgImage),
    active: o.active,
    items: o.items,
  })) as OfferEntity[];
}

export async function fetchOfferBySlug(slug: string) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '') ?? "";
  const res = await fetch(`${API_BASE}/api/offer/slug/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const offer = await res.json();
  return offer && offer._id ? offer : null;
}