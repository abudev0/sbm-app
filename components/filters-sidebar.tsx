"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, ChevronDown } from "lucide-react";

type Item = { key: string; label: string; count: number };

export function FiltersSidebar({
  categories,
  brands,
  priceRange,
}: {
  categories: Item[];
  brands: Item[];
  priceRange: { min: number; max: number };
}) {
  const t = useTranslations("ProductsPage");
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // initial values come from URL if present, otherwise from inferred range
  const [localMin, setLocalMin] = useState<number>(
    Number(sp.get("minPrice") ?? priceRange.min)
  );
  const [localMax, setLocalMax] = useState<number>(
    Number(sp.get("maxPrice") ?? priceRange.max)
  );
  const [q, setQ] = useState<string>(sp.get("q") || sp.get("search") || "");

  // current selections from URL
  const selectedCats = useMemo(
    () => new Set((sp.get("category") || "").split(",").filter(Boolean)),
    [sp]
  );
  const selectedBrands = useMemo(
    () => new Set((sp.get("brand") || "").split(",").filter(Boolean)),
    [sp]
  );

  function updateParam(updater: (p: URLSearchParams) => void) {
    const p = new URLSearchParams(sp.toString());
    updater(p);
    p.set("page", "1"); // reset pagination

    // normalize: remove legacy keys if any
    p.delete("min");
    p.delete("max");
    p.delete("cat");
    p.delete("search");

    const qObj = Object.fromEntries(p.entries()) as Record<string, string>;
    startTransition(() => {
      router.push({ pathname: "/products", query: qObj });
    });
  }

  function toggleListParam(name: "category" | "brand", value: string) {
    updateParam((p) => {
      const cur = new Set((p.get(name) || "").split(",").filter(Boolean));
      if (cur.has(value)) cur.delete(value);
      else cur.add(value);
      const next = Array.from(cur);
      if (next.length) p.set(name, next.join(","));
      else p.delete(name);
    });
  }

  function applyPrice() {
    // guard: keep min ≤ max
    const min = Math.min(localMin, localMax);
    const max = Math.max(localMin, localMax);
    setLocalMin(min);
    setLocalMax(max);

    updateParam((p) => {
      p.set("minPrice", String(min));
      p.set("maxPrice", String(max));
    });
  }

  function clearAll() {
    startTransition(() => {
      router.push({ pathname: "/products" });
    });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam((p) => {
      const val = q.trim();
      if (val) p.set("q", val);
      else p.delete("q");
    });
  }

  return (
    <div className="p-4 sm:p-5">
      {/* Search */}
      <form onSubmit={onSearchSubmit} className="mb-4">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("searchPlaceholder") || "Qidirish"}
            className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
            aria-label={t("search") || "Search"}
          />
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        </div>
      </form>

      {/* Categories */}
      <Section title={t("filters.categoriesTitle") || "Kategoriya"} defaultOpen>
        <ul className="space-y-2">
          {categories.map((c) => (
            <li key={c.key} className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedCats.has(c.key)}
                  onChange={() => toggleListParam("category", c.key)}
                />
                <span className="text-sm text-gray-800">{c.label}</span>
              </label>
              <span className="text-xs text-gray-500">{c.count}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Brands */}
      <Section title={t("filters.brandsTitle") || "Brend"} defaultOpen>
        <ul className="space-y-2">
          {brands.map((b) => (
            <li key={b.key} className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedBrands.has(b.key)}
                  onChange={() => toggleListParam("brand", b.key)}
                />
                <span className="text-sm text-gray-800">{b.label}</span>
              </label>
              <span className="text-xs text-gray-500">{b.count}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* Price */}
      <Section title={t("filters.priceTitle") || "Narx"} defaultOpen>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                {t("filters.min") || "Min"}
              </label>
              <input
                type="number"
                value={localMin}
                min={priceRange.min}
                max={localMax}
                onChange={(e) => setLocalMin(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">
                {t("filters.max") || "Max"}
              </label>
              <input
                type="number"
                value={localMax}
                min={localMin}
                max={priceRange.max}
                onChange={(e) => setLocalMax(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
              />
            </div>
          </div>

          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={localMin}
            onChange={(e) => setLocalMin(Number(e.target.value))}
            className="w-full"
            aria-label={t("filters.min") || "Min"}
          />
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={localMax}
            onChange={(e) => setLocalMax(Number(e.target.value))}
            className="w-full"
            aria-label={t("filters.max") || "Max"}
          />
        </div>
      </Section>

      {/* Footer actions */}
      <div className="mt-5">
        <button
          onClick={clearAll}
          className="w-full rounded-md border border-gray-300 py-2 text-sm hover:bg-gray-50"
          disabled={isPending}
        >
          {t("clear") || "Tozalash"}
        </button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t first:border-0 py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium text-gray-900"
      >
        {title}
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
