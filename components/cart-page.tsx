"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, ShoppingCart } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useCartList } from "@/hooks/use-cart";
import type { LocaleCode } from "@/lib/cart";

/** Matn ko'rinishidagi narxlarni (masalan: "120 000", "120,000", "120 000 UZS") xavfsiz songa aylantiradi */
function toMoneyNumber(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  let s = String(v ?? "").trim().replace(/[\u00A0\u202F\s]/g, "");
  if (s.includes(",") && !s.includes(".")) s = s.replace(/,/g, ".");
  s = s.replace(/[^\d.-]/g, "");
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}

function pick<T extends { locale: LocaleCode }>(arr: T[] | undefined, locale: LocaleCode) {
  if (!arr || arr.length === 0) return undefined;
  return arr.find((tr) => tr.locale === locale) ?? arr[0];
}

function formatSum(n: number) {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(n);
}

export default function CartPage() {
  const locale = (useLocale() as LocaleCode) || "uz";
  const t = useTranslations("cart");
  const {
    items,
    allSelected,
    anySelected,
    selectedItems,
    totalQty,
    toggleAll,
    toggleOne,
    changeQty,
    removeOne,
  } = useCartList();
  const router = useRouter();

  // UI xavfsiz hisoblar
  const normalizedItems = items.map((it) => {
    const unitPrice = toMoneyNumber(it.price);
    const lineSum = unitPrice * it.qty;
    return { ...it, unitPrice, lineSum };
  });

  const normalizedSelectedItems = selectedItems.map((it) => {
    const unitPrice = toMoneyNumber(it.price);
    const lineSum = unitPrice * it.qty;
    return { ...it, unitPrice, lineSum };
  });

  const safeTotalSum = normalizedSelectedItems.reduce((acc, i) => acc + i.lineSum, 0);

  return (
    <main className="mx-auto px-3 py-3 pb-28 max-w-[480px]">
      {/* Sarlavha */}
      <div className="flex items-center gap-2 text-base font-semibold text-neutral-900">
        <ShoppingCart className="h-5 w-5" />
        <span>{t("title")}</span>
      </div>

      {/* List */}
      <section className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
        <label className="flex items-center gap-2 text-[15px] font-medium text-neutral-800">
          <input
            type="checkbox"
            className="h-4 w-4 accent-amber-500"
            checked={allSelected}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          {t("selectAll")}
        </label>

        {items.length === 0 ? (
          <div className="py-8 text-center text-neutral-600">
            {t("empty")}
            <div className="mt-3">
              <Link href="/products" className="text-amber-600 text-sm">
                ← {t("backToProducts")}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-neutral-200">
            {normalizedItems.map((it) => {
              const tr = pick(it.translations, locale);
              const name = tr?.name || it.name || "Product";
              const unitLabel = tr?.unitLabel || (locale === "ru" ? "За 1 шт." : "1 Donasi uchun");
              const img = it.image || "/placeholder.svg";

              return (
                <li key={it.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {/* Rasm (mobil uchun qat’iy o‘lcham) */}
                    <Link
                      href={{ pathname: "/products/[slug]", params: { slug: it.id } }}
                      className="shrink-0 rounded-2xl bg-[#FFF7E6] ring-1 ring-amber-200/60 overflow-hidden"
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
                        alt={name}
                        width={96}
                        height={96}
                        className="object-contain"
                      />
                    </Link>

                    {/* Info + amallar */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold text-neutral-900 line-clamp-2">
                            {name}
                          </h3>

                          <div className="mt-1 text-[12px] text-neutral-500">
                            <span className="opacity-80">{unitLabel} </span>
                            <span className="font-semibold text-neutral-900 ml-1">
                              {formatSum(it.unitPrice)} {t("currency")}
                            </span>
                          </div>

                          <div className="mt-1 text-[12px] text-neutral-500">
                            {t("lineTotal")}{" "}
                            <span className="font-semibold text-neutral-900 ml-1">
                              {formatSum(it.lineSum)} {t("currency")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => removeOne(it.id)}
                            className="text-rose-500 p-1 rounded-md active:scale-95"
                            aria-label={t("remove")}
                            title={t("remove")}
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                          <label className="inline-flex items-center gap-2 text-[13px] text-neutral-700">
                            <input
                              type="checkbox"
                              className="h-4 w-4 accent-amber-500"
                              checked={it.selected}
                              onChange={(e) => toggleOne(it.id, e.target.checked)}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Qty (44px touch) */}
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => changeQty(it.id, -1)}
                          className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 active:scale-95"
                          aria-label="-"
                        >
                          –
                        </button>
                        <div className="h-11 min-w-[48px] inline-flex items-center justify-center px-2 text-[16px] font-medium">
                          {it.qty}
                        </div>
                        <button
                          onClick={() => changeQty(it.id, +1)}
                          className="h-11 w-11 inline-flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-700 active:scale-95"
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Buyurtma haqida (mobil karta) */}
      {anySelected && (
        <section className="mt-3 rounded-xl border border-neutral-200 bg-white p-3">
          <h2 className="text-[15px] font-semibold text-neutral-900">{t("summaryTitle")}</h2>
          <div className="mt-1 text-[13px] text-neutral-700">
            {t("productsCount", { count: totalQty })}
          </div>

          <ul className="mt-2 space-y-1 text-[13px] text-neutral-700">
            {normalizedSelectedItems.map((i) => {
              const tr = pick(i.translations, locale);
              const name = tr?.name || i.name || "Product";
              return (
                <li key={i.id} className="flex gap-2">
                  <span>•</span>
                  <span>
                    {name} * {i.qty} = {formatSum(i.lineSum)} {t("currency")}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 flex items-center justify-between text-[14px]">
            <span className="text-neutral-600">{t("total")}</span>
            <span className="font-semibold text-neutral-900">
              {formatSum(safeTotalSum)} {t("currency")}
            </span>
          </div>

          {/* Qo'shimcha: summary ichida ham Buyurtmaga o'tish tugmasi */}
          <div className="mt-4">
            <button
              disabled={!anySelected}
              onClick={() => {
                if (!anySelected) return;
                router.push("/checkout");
              }}
              className={`w-full rounded-md px-4 py-3 text-[15px] font-semibold transition ${
                anySelected
                  ? "bg-amber-500 text-white active:scale-95"
                  : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {t("checkout")}
            </button>
          </div>
        </section>
      )}

      {/* Orqaga */}
      <div className="mt-3 mb-24">
        <Link href="/products" className="text-[14px] text-amber-600">
          ← {t("backToProducts")}
        </Link>
      </div>

      {/* Sticky pastki panel: jami + checkout */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-t border-neutral-200">
        <div className="mx-auto max-w-[480px] px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="text-neutral-500">{t("total")}</div>
              <div className="text-base font-semibold text-neutral-900">
                {formatSum(safeTotalSum)} {t("currency")}
              </div>
            </div>
            <button
              disabled={!anySelected}
              onClick={() => {
                if (!anySelected) return;
                router.push({ pathname: "/checkout" });
              }}
              className={`rounded-lg px-4 py-3 text-[15px] font-semibold transition ${
                anySelected
                  ? "bg-amber-500 text-white active:scale-95"
                  : "bg-neutral-200 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {t("checkout")}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}