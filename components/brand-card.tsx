"use client";

import { Link } from "@/i18n/routing";
import Image from "next/image";
import React from "react";

export type Brand = {
  id: string | number;
  name: string;
  logoSrc: string;
  description: string;
  href: string;
};

type Props = {
  brand: Brand;
  className?: string;
};

export function BrandCard({ brand, className = "" }: Props) {

  const rawHref = String(brand.href || "").trim();
  const slug = rawHref.split("/").filter(Boolean).pop() || "";

  // next-intl routing uchun dinamik marshrut
  const href =
    slug.length > 0
      ? ({ pathname: "/brands/[slug]", params: { slug } } as const)
      : ({ pathname: "/brands" } as const);

  return (
    <article
      className={[
        "group relative flex flex-col justify-between max-h-[562px] h-full rounded-2xl p-4",
        className,
      ].join(" ")}
    >
      {/* Logo tile */}
      <div className="relative rounded-xl p-6 flex items-center justify-center h-60 shadow-[0_0px_10px_rgba(0,0,0,0.10)] bg-white">
        <Image
          src={brand.logoSrc || "/placeholder.png"}
          alt={brand.name}
          fill
          sizes="(max-width: 640px) 100vw, 256px"
          className="object-contain"
          loading="lazy"
          draggable={false}
        />
      </div>

      {/* Description (ixtiyoriy) */}
      {brand.description ? (
        <div className="mt-4 text-[13.5px] text-neutral-700 font-bold p-2">
          <p
            title={brand.description}
            style={{
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 4, // ixtiyoriy qirqish
            }}
          >
            {brand.description}
          </p>
        </div>
      ) : (
        <div className="mt-4 p-2" />
      )}

      {/* Button */}
      <div className="mt-4 flex justify-center">
        <Link
          href={href}
          className="inline-flex items-center justify-center rounded-md border border-[#ffcf63] bg-white px-4 py-2 text-[11.5px] font-semibold uppercase tracking-wide text-neutral-700 "
        >
          Brand mahsulotlarini ko‘rish
        </Link>
      </div>
    </article>
  );
}

export default BrandCard;