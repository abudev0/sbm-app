"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ChevronLeft, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/ui/product-card";
import { FavoriteItem } from "@/lib/favorites";
import { useFavoritesList } from "@/hooks/use-favorite";

type FavProduct = {
  slug: string;
  name: string;
  nameRu: string;
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  image: string;
  rating: number;
  pQuantity?: number;
  sold?: number;
  attributes?: string[];
};

function cleanAttributes(input: unknown): string[] {
  const arr = Array.isArray(input) ? input : [];
  return arr
    .map((s) => (typeof s === "string" ? s.trim() : ""))
    .filter(Boolean);
}

export default function FavoritesPage() {
  const t = useTranslations("WishlistPage");
  const locale = useLocale();
  const isRu = locale?.toLowerCase().startsWith("ru");
  const { items: favs, clearAll } = useFavoritesList();

  const PAGE_SIZE = 8;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const mapped: FavProduct[] = useMemo(() => {
    return (favs || []).map((f: FavoriteItem) => {
      const price = typeof f.price === "number" ? f.price : 0;
      const discountPercent =
        typeof f.discountPercent === "number" ? f.discountPercent : undefined;

      const oldPrice =
        typeof f.oldPrice === "number"
          ? f.oldPrice
          : discountPercent
            ? Math.round(price / (1 - discountPercent / 100))
            : undefined;

      return {
        slug: f.id,
        name: f.name || "",
        nameRu: f.nameRu || f.name || "",
        price,
        oldPrice,
        discountPercent,
        image: f.image || "",
        rating: typeof f.rating === "number" ? f.rating : 0,
        pQuantity: f.pQuantity,
        sold: f.sold,
        attributes: cleanAttributes((f as any).attributes), // 👈 bo‘sh/soxta qiymatlar olib tashlanadi
      };
    });
  }, [favs]);

  const total = mapped.length;
  const visibleItems = mapped.slice(0, visibleCount);
  const hasMore = visibleCount < total;

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </Link>
          <h1 className="text-lg sm:text-xl font-semibold">
            {t("title")} <span className="text-sm text-gray-500">({total})</span>
          </h1>
        </div>

        {total > 0 && (
          <button
            type="button"
            onClick={clearAll}
            aria-label={t("clearAll")}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 rounded-full p-2 md:p-0 md:gap-2 md:text-sm"
          >
            <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
            <span className="hidden md:inline">{t("clearAll")}</span>
          </button>

        )}
      </div>

      {/* Content */}
      {total === 0 ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-gray-600">
          {t("empty")}
          <div className="mt-3">
            <Link
              href="/products"
              className="inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              {t("goShop")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {visibleItems.map((p) => (
              <ProductCard
                key={p.slug}
                slug={p.slug}
                name={isRu ? p.nameRu : p.name}
                nameRu={p.nameRu}
                price={p.price}
                oldPrice={p.oldPrice}
                discountPercent={p.discountPercent}
                image={p.image}
                rating={p.rating}
                pQuantity={p.pQuantity}
                sold={p.sold}
                attributes={p.attributes || []} // 👈 endi sof, bo‘shlarsiz
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() =>
                  setVisibleCount((c) => Math.min(c + PAGE_SIZE, total))
                }
                className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 hover:bg-gray-50 text-sm"
              >
                {t("showMore")}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
