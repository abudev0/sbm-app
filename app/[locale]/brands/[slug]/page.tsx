import Image from "next/image";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ProductCard } from "@/components/ui/product-card";
import { fetchBrandBySlug } from "@/lib/api/brand";
import { fetchProductsByBrand } from "@/lib/api/products";
export type Lang = 'uz' | 'ru';
// Lokal resolver agar umumiy helperdan foydalanmayotgan bo'lsangiz:
export type LangMap = { uz?: string; ru?: string; [k: string]: string | undefined };
export function resolveText(map?: LangMap, locale?: string | Lang): string {
  if (!map) return "";
  const loc = String(locale || "uz").toLowerCase();
  const key: Lang = loc.startsWith("ru") ? "ru" : "uz";
  return map[key] || map.uz || map.ru || "";
}

type PageProps = { params: { locale: string; slug: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params: { locale, slug } }: PageProps): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "BrandPage" });
  const brand = await fetchBrandBySlug(slug);
  if (!brand) return { title: t("meta.notFoundTitle", { default: "Brend topilmadi" }) };

  const title = resolveText(brand.name, locale) || brand.slug;
  const desc = resolveText(brand.description, locale) || title;

  return {
    title: t("meta.title", { brand: title }),
    description: t("meta.description", { brand: title }) || desc,
    openGraph: {
      title,
      description: desc,
      images: brand.img ? [{ url: brand.img, alt: title }] : [],
    },
  };
}

export default async function BrandPage({ params: { locale, slug } }: PageProps) {
  const t = await getTranslations("BrandPage");

  const brand = await fetchBrandBySlug(slug);
  if (!brand) {
    return (
      <div className="min-h-screen  ">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-xl font-semibold">{t("notFound")}</h1>
          <Link href={{ pathname: "/" }} className="text-primary underline mt-3 inline-block">
            {t("backHome")}
          </Link>
        </div>
      </div>
    );
  }

  const brandName = resolveText(brand.name, locale) || brand.slug;
  const brandDesc = resolveText(brand.description, locale);

  // MUHIM: brand.slug yoki brand.id bilan filter (API talabiga qarab)
  const products = await fetchProductsByBrand({ brand: slug, page: 1, limit: 12 });

  return (
    <div className="min-h-screen bg-[#FFF7E4]">
      <div className="container mx-auto px-4 py-6 space-y-6">
        <nav className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href={{ pathname: "/" }} >
                {t("breadcrumbs.home")}
              </Link>
            </li>
            <li>›</li>
            <li>
              <Link href={{ pathname: "/brands" }} >
                {t("breadcrumbs.brands")}
              </Link>
            </li>
            <li>›</li>
            <li className="text-foreground">{brandName}</li>
          </ol>
        </nav>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-60 h-60 relative rounded-xl bg-white shadow">
            {brand.img && (
              <Image src={brand.img} alt={brandName} fill className="object-contain" priority />
            )}
          </div>
          <div className="flex-1">
            {brandDesc && (
              <p className="mt-3 leading-7 text-black font-bold text-lg text-center">{brandDesc}</p>
            )}
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("brandProductsTitle")}</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => {
              const nameUz = resolveText(p.name, "uz");
              const nameRu = resolveText(p.name, "ru");
              return (
                <ProductCard
                  key={p.id}
                  name={nameUz || nameRu || ""}
                  nameRu={nameRu || nameUz || ""}
                  price={p.price!}
                  oldPrice={p.oldPrice != null ? p.oldPrice : undefined}
                  discountPercent={p.discountPercent}
                  image={p.images[0].img}
                  rating={p.rating ?? 0}
                  sold={p.sold}
                  pQuantity={p.pQuantity}
                  slug={p.slug}
                  attributes={p.attributes}
                />
              );
            })}
            {!products.length && (
              <div className="col-span-full rounded-xl border bg-white p-8 text-center text-gray-600">
                {t("noProducts", { default: "Bu brend uchun mahsulotlar topilmadi" })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}