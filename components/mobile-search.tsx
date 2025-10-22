"use client";

import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Search, X } from "lucide-react";

export function MobileSearch() {
  const t = useTranslations("ProductsPage");
  const router = useRouter();
  const sp = useSearchParams();

  const [value, setValue] = useState("");

  useEffect(() => {
    // URL dagi mavjud qiymatni inputga yuklab qo'yamiz
    const initial = sp.get("q") || sp.get("search") || "";
    setValue(initial);
  }, [sp]);

  function updateUrl(nextQ: string) {
    const p = new URLSearchParams(sp.toString());

    if (nextQ.trim()) p.set("q", nextQ.trim());
    else p.delete("q");

    // normalize legacy
    p.delete("search");
    p.set("page", "1");

    const qObj = Object.fromEntries(p.entries()) as Record<string, string>;
    router.push({ pathname: "/products", query: qObj });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUrl(value);
  }

  function onClear() {
    setValue("");
    updateUrl("");
  }

  return (
    <div className="md:hidden mb-3 px-1">
      <form onSubmit={onSubmit} className="relative">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("searchPlaceholder") || "Qidirish"}
          aria-label={t("search") || "Qidirish"}
          className="w-full rounded-xl border border-amber-300 bg-white/70 pl-9 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-200"
        />
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
        {value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label={t("clear") || "Tozalash"}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-6 w-6 items-center justify-center rounded-full hover:bg-gray-100"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        ) : null}
      </form>
    </div>
  );
}

export default MobileSearch;