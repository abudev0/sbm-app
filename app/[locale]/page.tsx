import type { Metadata } from "next";
import { getHeroCategories } from "@/lib/api/category";
import { fetchBrandSlider } from "@/lib/api/brand";
import { fetchProducts, ProductEntity } from "@/lib/api/products";
import { HeroGrid } from "@/components/hero-grid";
import { BrandsSectionSlider } from "@/components/brands-section";
import { ProductsSection } from "@/components/products-section";
import { PromoSections } from "@/components/promo-sections";
import { NewsCarousel } from "@/components/news-section";
import { ProductsDiscountSection } from "@/components/products-discount-section";
import { NewProductsSection } from "@/components/products-new-section";
import { MostSearchedSection } from "@/components/most-searched-section";
import { getNews } from "@/lib/api/news";
import { fetchOffers } from "@/lib/api/offers";
import MobileSearch from "@/components/mobile-search";
import SpecialOffersSection from "@/components/special-offers-section";

type PageParams = { params: { locale: 'uz' | 'ru' } };

const buildProductHref = (locale: string, slug?: string) =>
  slug ? `/${locale}/products/${slug}` : `/${locale}/products`;

export async function generateMetadata({ params }: PageParams): Promise<Metadata> {
  const { locale } = params;
  const titles = { uz: "Bosh sahifa | SBM", ru: "Главная | SBM", en: "Home | SBM" };
  const descriptions = {
    uz: "O'zbekistondagi eng yaxshi mahsulotlar do'koni.",
    ru: "Лучший магазин товаров в Узбекистане.",
    en: "The best product store in Uzbekistan."
  };
  return {
    title: titles[locale],
    description: descriptions[locale],
    openGraph: {
      title: titles[locale],
      description: descriptions[locale],
      url: `https://sbm.uz/${locale}`,
      siteName: "SBM",
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "SBM" }],
      locale: locale + "_UZ",
      type: "website"
    },
    alternates: {
      canonical: `https://sbm.uz/${locale}`,
      languages: {
        uz: "https://sbm.uz/uz",
        ru: "https://sbm.uz/ru",
        en: "https://sbm.uz/en"
      }
    }
  };
}

export default async function HomePage({ params: { locale } }: PageParams) {
  const [categories, brands, news, productsRes, offers] = await Promise.all([
    getHeroCategories(locale),
    fetchBrandSlider({ lang: locale as 'uz' | 'ru' }),
    getNews(locale, 10),
    fetchProducts({ page: 1, limit: 48 }),
    fetchOffers({ page: 1, limit: 3, active: true })
  ]);

  // Ensure products have the required 'id' property for ProductEntity[]
  const products: ProductEntity[] = productsRes.items.map((item: any) => ({
    id: item.id,
    ...item
  }));
  fetchOffers({ page: 1, limit: 3, active: true })
  // Split into sections on server (no frontend fetch). Max 12 each.);

  const discountedItems = products.filter(p => typeof p.discount === "number" && p.discount > 0).slice(0, 12);

  const newestItems = products.slice(0, 12);

  const normalizeItems = (items: any[] | undefined) => {
    if (!Array.isArray(items)) return [];
    const linkKeys = ["href", "link", "url", "path"];
    return items.map(o => {
      if (!o || typeof o !== "object") return o;
      const copy: any = { ...o };
      let hasLink = linkKeys.some(k => typeof copy[k] === "string");
      linkKeys.forEach(k => {
        const v = copy[k];
        if (typeof v !== "string") return;
        if (v.includes("[slug]") && copy.slug) {
          copy[k] = buildProductHref(locale, copy.slug);
          hasLink = true;
          return;
        }
        if (v.startsWith("/products/[slug]") && copy.slug) {
          copy[k] = buildProductHref(locale, copy.slug);
          hasLink = true;
          return;
        }
        if ((v === "/products" || v === "products") && copy.slug) {
          copy[k] = buildProductHref(locale, copy.slug);
          hasLink = true;
          return;
        }
        if (v.startsWith("/products/") && !v.startsWith(`/${locale}/`)) {
          copy[k] = `/${locale}${v}`;
        }
      });
      if (copy.slug && !hasLink) {
        copy.href = buildProductHref(locale, copy.slug);
      }
      return copy;
    });
  };

  const categoriesNorm = normalizeItems(categories);

  const newsNorm = normalizeItems(news);


  if (process.env.NODE_ENV === "development") {
    const warnDynamic = (arr: any[], label: string) => {
      arr.forEach(i => {
        if (!i || typeof i !== "object") return;
        for (const k of ["href", "link", "url", "path"]) {
          const v = i[k];
          if (typeof v === "string" && v.includes("[slug]")) {
            // eslint-disable-next-line no-console
            console.warn(`[DYNAMIC LINK] ${label} still has unresolved pattern`, { key: k, value: v, slug: i.slug });
          }
        }
      });
    };
    warnDynamic(categoriesNorm, "categories");
    warnDynamic(brands, "brands");
    warnDynamic(newsNorm, "news");
  }

  return (
    <div className="min-h-screen bg-[#FFF7E4]">
      <main className="space-y-8 overflow-hidden">
        <div className="px-2">
          <MobileSearch />
        </div>
        <HeroGrid cards={categoriesNorm} />
        <BrandsSectionSlider brands={brands} />
        {/* Main products carousel */}
        <ProductsSection items={products} />
        <PromoSections />
        <NewsCarousel items={newsNorm} />
        {/* Discounted products */}
        <ProductsDiscountSection items={discountedItems} />
        <SpecialOffersSection offers={offers.map((offer: any) => ({
          _id: offer._id ?? offer.id ?? "",
          slug: offer.slug ?? "",
          items: offer.items ?? [],
          ...offer
        }))} />
        {/* New products */}
        <NewProductsSection items={newestItems} />
        <MostSearchedSection />
      </main>
    </div>
  );
}