"use client";

import Image from "next/image";
import { useMemo } from "react";
import { useCartList } from "@/hooks/use-cart";
import { useTranslations } from "next-intl";
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

export function CartSidebar({
  locale,
  title,
  deliveryPrice = 0,
  totalSumOverride,
  onPlaceOrder,
}: {
  locale: LocaleCode;
  title?: string;
  deliveryPrice?: number;
  totalSumOverride?: number;
  onPlaceOrder?: () => void;
}) {
  const t = useTranslations("CartSidebar");
  const nfLocale = String(locale).toLowerCase().startsWith("ru") ? "ru-RU" : "uz-UZ";
  const currencyShort = t("currencyShort");

  const { selectedItems, totalQty, totalSum } = useCartList();

  const lines = useMemo(() => {
    return selectedItems.map((i) => {
      const tr = i.translations?.find((tt: any) => tt.locale === locale) || i.translations?.[0];
      const name = tr?.name || i.name || t("productFallback");
      const lineSum = i.qty * i.price;
      return { id: i.id, name, img: toFullUrl(i.image), unitPrice: i.price, qty: i.qty, lineSum };
    });
  }, [selectedItems, locale, t]);

  const subtotal = totalSum;
  const grandTotal = typeof totalSumOverride === "number" ? totalSumOverride : subtotal + deliveryPrice;

  return (
    <div className="space-y-4">
      {/* Top list */}
      <div className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
        <div className="text-[15px] font-semibold text-neutral-900">
          {(title ?? t("title"))}:{" "}
          <span className="font-medium text-neutral-700">{t("itemsCount", { count: totalQty })}</span>
        </div>
        <div className="mt-2 h-px w-full bg-neutral-200" />
        <ul className="mt-2 space-y-3">
          {lines.map((l) => (
            <li key={l.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-[#FFF7E6] ring-1 ring-amber-200/60">
                <Image src={l.img} alt={l.name} fill className="object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-medium text-neutral-900 truncate">{l.name}</div>
                <div className="text-[12px] text-neutral-500">
                  {t("unitPriceLabel")}{" "}
                  <span className="font-semibold text-neutral-800">{formatSum(l.unitPrice, nfLocale)}</span> {currencyShort}
                </div>
                <div className="text-[12px] text-neutral-500">
                  {t("lineTotal")}{" "}
                  <span className="font-semibold text-neutral-800">{formatSum(l.lineSum, nfLocale)}</span> {currencyShort}{" "}
                  <span className="opacity-70">({l.qty})</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Gold card */}
      <div className="rounded-xl bg-[#f8cd46] p-4">
        <div className="text-[15px] font-semibold text-neutral-900">{t("detailsTitle")}</div>
        <div className="mt-1 text-[13px] text-neutral-800">{t("productsLine", { count: totalQty })}</div>

        <div className="mt-2 rounded-lg border border-amber-300/90 bg-amber-50/40 p-3">
          <ul className="space-y-1 text-[13px] text-neutral-800">
            {lines.map((l) => (
              <li key={l.id} className="list-disc list-inside">
                {l.name} × {l.qty} = {formatSum(l.lineSum, nfLocale)} {currencyShort}
              </li>
            ))}
            <li className="list-disc list-inside">
              {t("deliveryLine", { price: formatSum(deliveryPrice, nfLocale), currency: currencyShort })}
            </li>
          </ul>
        </div>

        <div className="mt-3 flex items-center justify-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 shadow-sm w-full">
          <span className="text-[13px] font-semibold text-neutral-900">{t("totalLabel")}</span>
          <span className="text-[15px] font-bold text-neutral-900 tabular-nums">
            {formatSum(grandTotal, nfLocale)} {t("currencyLong")}
          </span>
        </div>

        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onPlaceOrder}
            className="w-full  rounded-xl bg-white text-[#d2ac45] hover:from-amber-200 hover:to-amber-300 active:scale-[0.99] transition px-5 py-2.5 text-[14px] font-semibold shadow"
            aria-label={t("placeOrder")}
          >

            {t("placeOrder")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartSidebar;
