import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import ProductDetails from "@/components/product-details";
import { ProductsCarousel } from "@/components/ui/products-carousel";
import dynamicImport from "next/dynamic";
import {
  fetchProducts,
  fetchProductById,
  fetchProductBySlugFallback,
  RawProduct,
  resolveProductName,
  resolveProductDescription,
  computeFinalPrice,
  extractImages,
  isObjectIdLike,
} from "@/lib/api/products";

export const dynamic = "force-dynamic";

type PageProps = { params: { locale: string; slug: string } };

const ProductGallery = dynamicImport(
  () => import("@/components/product-gallery").then((m) => m.default),
  { ssr: false }
);

export async function generateMetadata({ params: { locale, slug } }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "ProductPage" });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  let product: RawProduct | null = null;
  if (isObjectIdLike(slug)) product = await fetchProductById(slug);
  if (!product) product = await fetchProductBySlugFallback(slug);

  if (!product) {
    return {
      title: t("meta.notFoundTitle"),
      description: "",
      alternates: { canonical: `${site}/${locale}/products/${slug}` },
    };
  }

  const isRu = locale.toLowerCase().startsWith("ru");
  const title = isRu ? (resolveProductName(product, "ru") || resolveProductName(product, locale)) : resolveProductName(product, locale);
  const description = isRu
    ? (resolveProductDescription(product, "ru") || resolveProductDescription(product, locale))
    : resolveProductDescription(product, locale);

  const { images: imagesNormalized } = extractImages(product);
  const canonical = `${site}/${locale}/products/${product.slug || product._id}`;
  const languages: Record<string, string> = {
    uz: `${site}/uz/products/${product.slug || product._id}`,
    ru: `${site}/ru/products/${product.slug || product._id}`,
  };

  return {
    title,
    description: (description || "").slice(0, 160),
    alternates: { canonical, languages },
    openGraph: {
      title,
      description: (description || "").slice(0, 200),
      type: "website",
      url: canonical,
      images: (imagesNormalized || [])
        .filter(Boolean)
        .map((img) => ({ url: img.startsWith("http") ? img : site + (img.startsWith("/") ? img : "/" + img), alt: title })),
    },
    twitter: { card: "summary_large_image", title, description: (description || "").slice(0, 200) },
  };
}

export default async function ProductDetailPage({ params: { locale, slug } }: PageProps) {
  const t = await getTranslations({ locale, namespace: "ProductPage" });
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  let product: RawProduct | null = null;
  if (isObjectIdLike(slug)) product = await fetchProductById(slug);
  if (!product) product = await fetchProductBySlugFallback(slug);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF7E4]">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-xl font-semibold">{t("notFound")}</h1>
          <Link href={{ pathname: "/products" }} className="text-primary underline mt-3 inline-block">
            {t("backToProducts")}
          </Link>
        </div>
      </div>
    );
  }

  const isRu = locale.toLowerCase().startsWith("ru");
  const name = isRu ? (resolveProductName(product, "ru") || resolveProductName(product, locale)) : resolveProductName(product, locale);
  const description = isRu
    ? (resolveProductDescription(product, "ru") || resolveProductDescription(product, locale))
    : resolveProductDescription(product, locale);
  const { images: imagesNormalized } = extractImages(product);

  const newestResp = await fetchProducts({ page: 1, limit: 12 });
  const newest = newestResp.items
    .filter((p) => (p.slug || p._id) !== (product!.slug || product!._id))
    .slice(0, 10)
    .map((p) => {
      const nm = resolveProductName(p, locale);
      const nmRu = resolveProductName(p, "ru");
      const { finalPrice, oldPrice, discountPercent } = computeFinalPrice(p.price, p.discount);
      const { images: imgs } = extractImages(p);
      return {
        slug: p.slug || p._id,
        name: nm,
        nameRu: nmRu,
        price: finalPrice,
        image: imgs[0] || "",
        rating: (p as any).rating ?? 0,
        oldPrice: typeof oldPrice === "number" ? oldPrice : undefined,
        discountPercent,
        attributes: p.attributes || [],
      };
    });

  const { finalPrice } = computeFinalPrice(product.price, product.discount);

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description: (description || name).slice(0, 300),
    image: (imagesNormalized || []).map((img) => (img.startsWith("http") ? img : site + (img.startsWith("/") ? img : "/" + img))),
    brand: { "@type": "Brand", name: " " },
    sku: product.slug || product._id,
    offers: {
      "@type": "Offer",
      priceCurrency: product.currency || "UZS",
      price: String(finalPrice),
      url: `${site}/${locale}/products/${product.slug || product._id}`,
      availability: "https://schema.org/InStock",
    },
    ...(typeof product.rating === "number"
      ? { aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating.toFixed(1), reviewCount: (product as any).rating_count ?? 0 } }
      : {}),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isRu ? "Главная" : "Bosh sahifa", item: `${site}/${locale}` },
      { "@type": "ListItem", position: 2, name: isRu ? "Товары" : "Mahsulotlar", item: `${site}/${locale}/products` },
      { "@type": "ListItem", position: 3, name, item: `${site}/${locale}/products/${product.slug || product._id}` },
    ],
  };

  return (
    <div className="min-h-screen bg-[#FFF7E4]">
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-md">
        <nav className="text-xs text-gray-500" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><Link href={{ pathname: "/" }}>{t("breadcrumbs.home")}</Link></li>
            <li aria-hidden="true">›</li>
            <li><Link href={{ pathname: "/products" }}>{t("breadcrumbs.products")}</Link></li>
            <li aria-hidden="true">›</li>
            <li className="text-gray-800" aria-current="page">{name}</li>
          </ol>
        </nav>

        {/* Gallery */}
        <ProductGallery images={imagesNormalized} />

        {/* Mobile details panel (with inline actions row) */}
        <ProductDetails
          product={{
            id: product._id,
            slug: product.slug || product._id,
            brand_id: product.brand_id!,
            category: "sut",
            nameUz: resolveProductName(product, "uz") || name,
            nameRu: resolveProductName(product, "ru") || name,
            price: finalPrice,
            oldPrice: undefined,
            discountPercent: product.discount && product.discount > 0 ? product.discount : undefined,
            images: product.images as any,
            image: imagesNormalized[0] || "",
            rating: product.rating ?? 0,
            liked: false,
            createdAt: product.createdAt || new Date().toISOString(),
            descriptionUz: resolveProductDescription(product, "uz") || "",
            descriptionRu: resolveProductDescription(product, "ru") || "",
            attributes: product.attributes || [],
          }}
          locale={locale}
        />

        {/* Similar products */}
        {newest.length > 0 && (
          <ProductsCarousel
            title={t("newTitle")}
            viewAllHref={{ pathname: "/products", query: { sort: "new" } }}
            viewAllLabel={t("seeAll")}
            items={newest}
          />
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
    </div>
  );
}