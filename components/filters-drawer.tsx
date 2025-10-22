"use client";

import React, { useEffect, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Check,
  ChevronRight,
} from "lucide-react";

type Item = { key: string; label: string; count: number };

export function MobileFiltersBar({
  categories,
  brands,
  priceRange,
  activeSort,
  sortTabs,
  labels,
}: {
  categories: Item[];
  brands: Item[];
  priceRange: { min: number; max: number };
  activeSort: "all" | "new" | "rating" | "liked" | "sale";
  sortTabs: Array<{ key: "all" | "new" | "rating" | "liked" | "sale"; label: string }>;
  labels?: { filter?: string; sort?: string; title?: string };
}) {
  const t = useTranslations("ProductsPage");
  const [openFilters, setOpenFilters] = React.useState(false);
  const [openSort, setOpenSort] = React.useState(false);

  useEffect(() => {
    const lock = openFilters || openSort;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openFilters, openSort]);

  const filterLabel = labels?.filter ?? t("filter") ?? "Filtr";
  const sortLabel = labels?.sort ?? t("sort") ?? "Saralash";
  const sheetTitle = labels?.title ?? t("filtersTitle") ?? "Filtr";

  return (
    <div className="md:hidden mb-3">
      {/* Buttons row */}
      <div className="flex items-center gap-3 px-1">
        <button
          type="button"
          onClick={() => setOpenFilters(true)}
          className="flex-[2] inline-flex items-center justify-center gap-2 rounded-lg bg-[#FFDE87] text-black font-semibold px-4 py-2 shadow-sm"
          aria-label={filterLabel}
        >
          <span>{filterLabel}</span>
          <SlidersHorizontal className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpenSort(true)}
          className="flex-1 inline-flex items-center gap-2 rounded-lg bg-white border px-4 py-2 text-sm shadow-sm"
          aria-label={sortLabel}
        >
          <span className="text-sm">{sortLabel}</span>
          <ArrowUpDown className="h-4 w-4" />
        </button>
      </div>

      {openFilters && (
        <FiltersSheet title={sheetTitle} onClose={() => setOpenFilters(false)}>
          <div className="p-4">
            <div className="space-y-4">
              {/* Categories */}
              <div>
                <h4 className="text-base font-semibold mb-3">
                  {t("filters.categoriesTitle") ?? "Kategoriya"}
                </h4>
                <ul className="space-y-3">
                  {categories.map((c) => (
                    <li key={c.key} className="flex items-center justify-between">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          aria-label={`${t("filters.category") ?? "Category"} ${c.label}`}
                        />
                        <span className="text-sm">{c.label}</span>
                      </label>
                      <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-800 shadow-sm">
                        {c.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Brands */}
              <div>
                <h4 className="text-base font-semibold mb-3">
                  {t("filters.brandsTitle") ?? "Brandlar"}
                </h4>
                <ul className="space-y-3">
                  {brands.map((b) => (
                    <li key={b.key} className="flex items-center justify-between">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300"
                          aria-label={`${t("filters.brand") ?? "Brand"} ${b.label}`}
                        />
                        <span className="text-sm">{b.label}</span>
                      </label>
                      <span className="text-xs bg-white rounded-full px-2 py-0.5 text-gray-800 shadow-sm">
                        {b.count}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price */}
              <div>
                <h4 className="text-base font-semibold mb-3">
                  {t("filters.priceTitle") ?? "Narx"}
                </h4>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={priceRange.min}
                    className="w-1/2 rounded-md border border-gray-200 px-3 py-2 text-sm"
                    aria-label={t("filters.min") ?? "Min"}
                  />
                  <input
                    type="number"
                    defaultValue={priceRange.max}
                    className="w-1/2 rounded-md border border-gray-200 px-3 py-2 text-sm"
                    aria-label={t("filters.max") ?? "Max"}
                  />
                </div>
                <div className="mt-3">
                  <input
                    type="range"
                    min={priceRange.min}
                    max={priceRange.max}
                    defaultValue={priceRange.min}
                    className="w-full accent-amber-400"
                    aria-label={t("filters.priceRange") ?? "Price range"}
                  />
                </div>
              </div>
            </div>

            {/* Footer actions */}
            <div className="mt-5 flex gap-3">
              <button className="flex-1 rounded-md bg-white border py-3 text-sm">
                {t("clear") ?? "Tozalash"}
              </button>
              <button className="flex-1 rounded-md bg-amber-300 py-3 text-sm font-semibold">
                {t("apply") ?? "Qoʻllash"}
              </button>
            </div>
          </div>
        </FiltersSheet>
      )}

      {openSort && (
        <SortSheet
          tabs={sortTabs}
          active={activeSort}
          onClose={() => setOpenSort(false)}
        />
      )}
    </div>
  );
}

function FiltersSheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("ProductsPage");

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />

      {/* sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute left-4 top-8 bottom-8 w-[86vw] max-w-xs bg-amber-100 rounded-xl shadow-xl border border-amber-300 overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            type="button"
            aria-label={t("close") || "Yopish"}
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="h-full overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}

function SortSheet({
  tabs,
  active,
  onClose,
}: {
  tabs: Array<{ key: "all" | "new" | "rating" | "liked" | "sale"; label: string }>;
  active: "all" | "new" | "rating" | "liked" | "sale";
  onClose: () => void;
}) {
  const t = useTranslations("ProductsPage");
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function setSort(key: typeof active) {
    const p = new URLSearchParams(sp.toString());
    p.set("sort", key);
    p.set("page", "1");
    const qObj = Object.fromEntries(p.entries()) as Record<string, string>;
    startTransition(() => {
      router.push({ pathname: "/products", query: qObj });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute inset-x-4 top-28 bg-white rounded-xl shadow-lg border">
        <div className="py-2">
          <ul className="divide-y">
            {tabs.map((tab) => {
              const selected = tab.key === active;
              return (
                <li key={tab.key}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => setSort(tab.key)}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-gray-800 hover:bg-gray-50"
                    aria-pressed={selected}
                  >
                    <span className="text-sm">{tab.label}</span>
                    {selected ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MobileFiltersBar;