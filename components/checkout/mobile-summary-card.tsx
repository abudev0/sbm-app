"use client";

import { useTranslations } from "next-intl";
import { useCartList } from "@/hooks/use-cart";
import type { LocaleCode } from "@/lib/cart";

function formatSum(n: number, nfLocale: string) {
  return new Intl.NumberFormat(nfLocale, { maximumFractionDigits: 0 }).format(n);
}

export default function MobileSummaryCard({
  locale,
  deliveryPrice,
  grandTotal,
  onPlaceOrder,
}: {
  locale: LocaleCode;
  deliveryPrice: number;
  grandTotal: number;
  onPlaceOrder?: () => void;
}) {
  const t = useTranslations("CartSidebar");
  const nfLocale = String(locale).toLowerCase().startsWith("ru") ? "ru-RU" : "uz-UZ";
  const currencyShort = t("currencyShort");

  const { selectedItems, totalQty } = useCartList();

  return (
    <div className="rounded-2xl border border-amber-300 bg-[#FFF2CC] p-4">
      <div className="text-[16px] font-bold text-neutral-900">{t("detailsTitle")}</div>
      <div className="mt-1 text-[13px] text-neutral-800">{t("productsLine", { count: totalQty })}</div>

      <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
        <ul className="space-y-1 text-[13px] text-neutral-800 list-disc list-inside">
          {selectedItems.map((i) => {
            const name = i.translations?.[0]?.name || i.name || t("productFallback");
            const lineSum = formatSum(i.qty * i.price, nfLocale);
            return (
              <li key={i.id}>
                {name} × {i.qty} = {lineSum} {currencyShort}
              </li>
            );
          })}
          <li>
            {t("deliveryLine", { price: formatSum(deliveryPrice, nfLocale), currency: currencyShort })}
          </li>
        </ul>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-white px-3 py-2 shadow-sm">
        <span className="text-[13px] font-semibold text-neutral-900">{t("totalLabel")}</span>
        <span className="text-[16px] font-extrabold text-neutral-900 tabular-nums">
          {formatSum(grandTotal, nfLocale)} {t("currencyLong")}
        </span>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={onPlaceOrder}
          className="w-full rounded-xl bg-[#FFD76A] text-neutral-900 hover:brightness-105 active:scale-[0.99] transition px-5 py-3 text-[15px] font-bold shadow"
          aria-label={t("placeOrder")}
        >
          {t("placeOrder")}
        </button>
      </div>
    </div>
  );
}