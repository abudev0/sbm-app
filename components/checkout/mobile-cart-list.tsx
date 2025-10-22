"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCartList } from "@/hooks/use-cart";
import type { LocaleCode } from "@/lib/cart";

function toFullUrl(rel?: string): string {
  if (!rel) return "/placeholder.svg";
  if (/^https?:\/\//i.test(rel)) return rel;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base.replace(/\/+$/, "") + "/" + rel.replace(/^\/+/, "");
}
function formatSum(n: number, nfLocale: string) {
  return new Intl.NumberFormat(nfLocale, { maximumFractionDigits: 0 }).format(n);
}

export default function MobileCartList({ locale }: { locale: LocaleCode }) {
  const t = useTranslations("CartSidebar");
  const nfLocale = String(locale).toLowerCase().startsWith("ru") ? "ru-RU" : "uz-UZ";
  const currencyShort = t("currencyShort");

  const { selectedItems, totalQty } = useCartList();

  return (
    <div className="rounded-2xl border border-neutral-200 bg-[#FFF7E4] p-3">
      <div className="text-[15px] font-semibold text-neutral-900">
        {t("title")}: <span className="font-medium text-neutral-700">{t("itemsCount", { count: totalQty })}</span>
      </div>
      <div className="mt-2 space-y-3">
        {selectedItems.map((i) => {
          const name = i.translations?.find((tt: any) => tt.locale === locale)?.name || i.name || t("productFallback");
          const unit = formatSum(i.price, nfLocale);
          const line = formatSum(i.price * i.qty, nfLocale);
          return (
            <div key={i.id} className="rounded-xl bg-white p-3 shadow-sm border border-amber-100">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#FFF7E6] ring-1 ring-amber-200/60">
                  <Image src={toFullUrl(i.image)} alt={name} fill className="object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-medium text-neutral-900 truncate">{name}</div>
                  <div className="text-[12px] text-neutral-500">
                    {t("unitPriceLabel")} <b className="text-neutral-800">{unit}</b> {currencyShort}
                  </div>
                  <div className="text-[12px] text-neutral-500">
                    {t("lineTotal")} <b className="text-neutral-800">{line}</b> {currencyShort} <span className="opacity-70">({i.qty})</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}