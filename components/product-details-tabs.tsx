"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";

export default function ProductDetailsTabs({
  composition = [],
  description = "",
}: {
  composition?: string[];
  description?: string;
}) {
  const t = useTranslations("ProductPage");
  const [active, setActive] = useState<"composition" | "about">("composition");

  return (
    <div className="mt-4">
      <div className="flex items-center rounded-xl gap-3 bg-[#FFDE87] p-1">
        <button
          onClick={() => setActive("composition")}
          className={[
            "px-4 py-2 rounded-xl font-medium text-sm flex-1",
            active === "composition" ? "bg-white text-black" : null,
          ].join(" ")}
          aria-pressed={active === "composition"}
        >
          {t("tab.composition")}
        </button>
        <button
          onClick={() => setActive("about")}
          className={[
            "px-4 py-2 rounded-xl font-medium text-sm flex-2",
            active === "about" ? "bg-white text-black" : null,
          ].join(" ")}
          aria-pressed={active === "about"}
        >
          {t("tab.about")}
        </button>
      </div>

      <div className="mt-3 ">
        {active === "composition" ? (
          composition?.length ? (
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              {composition.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">{t("noComposition") ?? "Tarkib mavjud emas"}</div>
          )
        ) : description ? (
          <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <div className="text-sm text-gray-500">{t("noDescription") ?? "Mahsulot haqida ma'lumot mavjud emas"}</div>
        )}
      </div>
    </div>
  );
}