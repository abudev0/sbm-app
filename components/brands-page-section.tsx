"use client";

import { useLocale, useTranslations } from "next-intl";
import { BrandListItem, BrandSliderItem } from "@/lib/api/brand";
import { BrandCard, type Brand } from "@/components/brand-card";

export type BrandsPageSectionProps = {
  brands: BrandListItem[];
};

export function BrandsSection({ brands }: BrandsPageSectionProps) {
  
  const t = useTranslations("BrandsSection");
  const locale = useLocale();
  const isRu = locale?.toLowerCase().startsWith("ru");

  if (!brands?.length) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t("title", { default: "Brendlar" })}
        </h2>
        <div className="text-sm text-gray-500">
          {t("empty", { default: "Brendlar mavjud emas" })}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {t("title", { default: "Brendlar" })}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((b) => {
          const brand: Brand = {
            id: b.id || b.slug,
            name: isRu ? (b.name?.ru || b.title || b.slug) : (b.title || b.name?.uz || b.slug),
            logoSrc: b.img,
            description: b.description!,
            href: `/brands/${b.slug}`,
          };
          return <BrandCard key={brand.id} brand={brand} />;
        })}
      </div>
    </section>
  );
}

export default BrandsSection;