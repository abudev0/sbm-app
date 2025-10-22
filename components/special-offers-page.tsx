"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { OfferCard, LocaleText } from "@/components/offer-card";

export type OfferUI = {
  id: string;
  title: LocaleText;
  slug: string;
  bgImage: string;
  active: boolean;
  items: any[];
};

export function SpecialOffersSection({ offers }: { offers: OfferUI[] }) {
  const t = useTranslations("SpecialOffersSection");

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{t("title")}</h2>
        {/* <Link
          href="/sales"
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
          aria-label={t("viewAllAria")}
        >
          {t("viewAll")} →
        </Link> */}
      </div>
      <div className="relative overflow-hidden xl:overflow-visible">
        <div className="no-scrollbar overflow-x-auto scroll-smooth xl:overflow-visible">
          <div className="flex gap-5 snap-x snap-mandatory px-1 py-2 xl:grid xl:grid-cols-3 xl:gap-5 xl:snap-none xl:px-0">
            {offers.map((o, i) => (
              <div
                key={o.id}
                className="snap-start shrink-0 w-1/2 sm:w-[60%] md:w-[48%] lg:w-[40%] xl:w-auto xl:shrink"
              >
                <OfferCard
                  title={o.title}
                  href={o.slug}
                  bgImage={o.bgImage}
                  priority={i === 0}
                  className="whitespace-pre-line"
                  size="md" // explicitly request the larger card
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
export default SpecialOffersSection;