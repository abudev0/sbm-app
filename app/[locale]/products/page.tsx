import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/ui/product-card";
import { FiltersSidebar } from "@/components/filters-sidebar";
import { MobileFiltersBar } from "@/components/filters-drawer";
import {
  fetchProducts,
  resolveProductName,
  computeFinalPrice,
  extractImages,
  extractWeight,
  RawProduct,
} from "@/lib/api/products";
import { fetchCategoriesForFilters } from "@/lib/category";
import { fetchBrandsForFilters } from "@/lib/brand";
import { MobileSearch } from "@/components/mobile-search";

type PageProps = {
  params: { locale: string };
  searchParams?: Record<string, string | string[] | undefined>;
};

function uniq<T>(arr: T[]) { return Array.from(new Set(arr)); }
function parseCsv(input?: string | string[] | null) {
  if (!input) return [];
  const s = Array.isArray(input) ? input.join(",") : input;
  return uniq(s.split(",").map((x) => x.trim()).filter(Boolean));
}

// Canonical URL builder (SEO)
function buildCanonical(base: string, locale: string, rawParams: URLSearchParams) {
  const allowed = ["page", "sort", "brand", "category", "q", "minPrice", "maxPrice"];
  const c = new URLSearchParams();
  for (const key of allowed) {
    const v = rawParams.get(key);
    if (v) c.set(key, v);
  }
  const qs = c.toString();
  return `${base}/${locale}/products${qs ? "?" + qs : ""}`;
}

export async function generateMetadata({ params: { locale }, searchParams }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ProductsPage" });
  const base = process.env.NEXT_PUBLIC_SITE_URL! ;

  const raw = new URLSearchParams(
    Object.entries(searchParams ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
      if (Array.isArray(v)) acc[k] = v.join(",");
      else if (typeof v === "string") acc[k] = v;
      return acc;
    }, {})
  );

  const canonical = buildCanonical(base, locale, raw);
  const languages: Record<string, string> = {
    uz: buildCanonical(base, "uz", raw),
    ru: buildCanonical(base, "ru", raw),
  };

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    alternates: { canonical, languages },
    openGraph: { title: t("meta.title"), description: t("meta.description"), type: "website", url: canonical },
    twitter: { card: "summary_large_image", title: t("meta.title"), description: t("meta.description") },
  };
}

export default async function ProductsPage({ params: { locale }, searchParams }: PageProps) {
  const t = await getTranslations("ProductsPage");

  // URL param parsing
  const urlParams = new URLSearchParams(
    Object.entries(searchParams ?? {}).reduce<Record<string, string>>((acc, [k, v]) => {
      if (Array.isArray(v)) acc[k] = v.join(",");
      else if (typeof v === "string") acc[k] = v;
      return acc;
    }, {})
  );

  // UI paramlar -> backend nomlariga map
  const q = urlParams.get("q") || urlParams.get("search") || "";
  const catCsv = parseCsv(urlParams.get("category"));
  const brandCsv = parseCsv(urlParams.get("brand"));
  const minPrice = Number(urlParams.get("minPrice") || "") || undefined;
  const maxPrice = Number(urlParams.get("maxPrice") || "") || undefined;

  const uiSort = (urlParams.get("sort") || "all") as "all" | "new" | "rating" | "liked" | "sale";
  const sortMap: Record<typeof uiSort, "newest" | "discount" | "price_asc" | "price_desc" | "sold"> = {
    all: "newest",
    new: "newest",
    rating: "sold",
    liked: "newest",
    sale: "discount",
  };

  const page = Math.max(1, Number(urlParams.get("page") || "1"));
  const limit = 12;

  // Parallel fetch: products + categories + brands
  let listResp: { meta: { page: number; limit: number; total: number; pages: number }; items: RawProduct[] };
  const [catsRaw, brandsRaw] = await Promise.all([
    fetchCategoriesForFilters(),
    fetchBrandsForFilters(),
  ]);

  try {
    listResp = await fetchProducts({
      page,
      limit,
      search: q || undefined,
      brand: brandCsv.length ? brandCsv.join(",") : undefined,
      category: catCsv.length ? catCsv.join(",") : undefined,
      minPrice,
      maxPrice,
      sort: sortMap[uiSort],
    });
  } catch {
    listResp = { meta: { page: 1, limit, total: 0, pages: 1 }, items: [] };
  }

  const totalPages = Math.max(1, listResp.meta.pages || 1);

  // UI mapping
  const uiProducts = listResp.items.map((p) => {
    const name = resolveProductName(p, locale);
    const nameRu = resolveProductName(p, "ru");
    const { finalPrice, oldPrice, discountPercent } = computeFinalPrice(p.price, p.discount);
    const { primaryImage } = extractImages(p);
    const weight = extractWeight(p.attributes);
    return {
      id: p._id,
      slug: p.slug || p._id,
      displayName: name,
      displayNameRu: nameRu,
      finalPrice,
      priceFormatted: finalPrice,
      oldPriceFormatted: oldPrice || undefined,
      discountPercent,
      primaryImage,
      rating: (p as any).rating_avg ?? (p as any).rating ?? 0,
      sold: p.sold ?? 0,
      pQuantity: p.stock ?? 0,
      attributes: p.attributes,
    };
  });

  // Filters list — backenddan olingan ro‘yxatlar
  const categories = catsRaw.map((c) => ({
    key: c.slug,
    label: locale.startsWith("ru") ? (c.name?.ru || c.slug) : (c.name?.uz || c.slug),
    // Count: faqat joriy sahifa itemlari bo‘yicha:
    count: listResp.items.filter((p) => {
      const pc = (p as any)?.category_id;
      const key = typeof pc === "object" ? pc?.slug : pc;
      return key === c.slug;
    }).length,
  }));

  const brands = brandsRaw.map((b) => ({
    key: b.slug,
    label: locale.startsWith("ru") ? (b.name?.ru || b.slug) : (b.name?.uz || b.slug),
    count: listResp.items.filter((p) => ((p as any)?.brand_id?.slug) === b.slug).length,
  }));

  const priceRange = {
    min: uiProducts.length ? Math.min(...uiProducts.map((p) => p.finalPrice)) : 0,
    max: uiProducts.length ? Math.max(...uiProducts.map((p) => p.finalPrice)) : 0,
  };

  // Tabs
  const tabs: Array<{ key: typeof uiSort; label: string }> = [
    { key: "all", label: t("tabs.all") },
    { key: "new", label: t("tabs.new") },
    { key: "rating", label: t("tabs.topRating") },
    { key: "liked", label: t("tabs.liked") },
    { key: "sale", label: t("tabs.sale") },
  ];

  // JSON-LD
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: uiProducts.map((p, idx) => ({
      "@type": "ListItem",
      position: (page - 1) * limit + idx + 1,
      url: `${site}/${locale}/products/${p.slug}`,
      name: locale.startsWith("ru") ? p.displayNameRu || p.displayName : p.displayName,
    })),
  };

  const canonicalBase = buildCanonical(site, locale, urlParams);
  const prevHref =
    page > 1
      ? canonicalBase.replace(/(\?|$)/, (m) =>
        (canonicalBase.includes("?") ? "&" : "?") + `page=${page - 1}` + (m === "?" ? "" : "")
      )
      : null;
  const nextHref =
    page < totalPages
      ? canonicalBase.replace(/(\?|$)/, (m) =>
        (canonicalBase.includes("?") ? "&" : "?") + `page=${page + 1}` + (m === "?" ? "" : "")
      )
      : null;

  return (
    <div className="min-h-screen bg-[#FFF7E4]">
      {prevHref && <link rel="prev" href={prevHref} />}
      {nextHref && <link rel="next" href={nextHref} />}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <MobileSearch />
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t("title")}</h1>

          <nav className="hidden md:flex items-center gap-2" aria-label="Products sort">
            {tabs.map((tab) => {
              const href = new URLSearchParams(urlParams);
              href.set("sort", tab.key);
              href.set("page", "1");
              return (
                <Link
                  key={tab.key}
                  href={{ pathname: "/products", query: `${href.toString()}` }}
                  className={[
                    "rounded-full px-3 py-1.5 text-sm",
                    uiSort === tab.key ? "bg-gray-900 text-white" : "text-gray-700 ",
                  ].join(" ")}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>
       
        <MobileFiltersBar
          categories={categories}
          brands={brands}
          priceRange={priceRange}
          activeSort={uiSort}
          sortTabs={tabs}
          labels={{ filter: t("filter"), sort: t("sort"), title: t("filtersTitle") }}
        />


        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
          <aside className="hidden md:block rounded-2xl bg-[#edf1ff] border border-gray-100 shadow-sm !max-h-[833px]" aria-label={t("filtersTitle")}>
            <FiltersSidebar categories={categories} brands={brands} priceRange={priceRange} />
          </aside>

          <section className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4" aria-live="polite">
              {uiProducts.map((p) => (
                <ProductCard
                  key={p.slug}
                  slug={p.slug}
                  name={p.displayName}
                  nameRu={p.displayNameRu}
                  price={p.priceFormatted}
                  oldPrice={p.oldPriceFormatted}
                  discountPercent={p.discountPercent}
                  image={p.primaryImage}
                  rating={p.rating!}
                  sold={p.sold}
                  pQuantity={p.pQuantity}
                  attributes={p.attributes}
                />
              ))}
              {uiProducts.length === 0 && (
                <div className="col-span-full rounded-xl border bg-white/70 p-6 text-center text-gray-700">
                  {t("empty")}
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
              <Pagination totalPages={totalPages} currentPage={page} params={urlParams} />
            </div>
          </section>
        </div>
      </main>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
    </div>
  );
}

function Pagination({ totalPages, currentPage, params }: { totalPages: number; currentPage: number; params: URLSearchParams; }) {
  const pages = Array.from({ length: totalPages }).map((_, i) => i + 1);
  const makeHref = (p: number): { pathname: "/products"; query: string } => {
    const q = new URLSearchParams(params);
    q.set("page", String(p));
    return { pathname: "/products", query: `${q.toString()}` };
  };
  return (
    <>
      <Link href={makeHref(Math.max(1, currentPage - 1))} className="rounded-md border px-3 py-1.5 text-sm text-gray-700 " aria-label="Previous page">‹</Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={makeHref(p)}
          aria-current={p === currentPage ? "page" : undefined}
          className={["rounded-md border px-3 py-1.5 text-sm", p === currentPage ? "bg-gray-900 text-white" : "text-gray-700 "].join(" ")}
        >
          {p}
        </Link>
      ))}
      <Link href={makeHref(Math.min(totalPages, currentPage + 1))} className="rounded-md border px-3 py-1.5 text-sm text-gray-700 " aria-label="Next page">›</Link>
    </>
  );
}
