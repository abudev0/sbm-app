"use client";

import Image from "next/image";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/routing";

type LocaleKey = "uz" | "ru";
export type LocaleText = { uz: string; ru: string };

export interface OfferCardProps {
  title: LocaleText | string;
  href: string;
  bgImage: string;
  className?: string;
  priority?: boolean;
  /**
   * size: "xs" very compact, "sm" compact, "md" default (larger)
   */
  size?: "xs" | "sm" | "md";
}

export function OfferCard({
  title,
  href,
  bgImage,
  className,
  priority,
  size = "md", // increased default size
}: OfferCardProps) {
  const rawLocale = useLocale();
  const lang: LocaleKey = rawLocale?.toLowerCase().startsWith("ru") ? "ru" : "uz";
  const text = typeof title === "string" ? title : title[lang] || title.uz || title.ru;

  // sizes tuned to be a bit larger than previous "small" versions
  const sizeClasses = {
    xs: {
      wrapper: "aspect-square rounded-lg max-w-[140px] sm:max-w-[160px] mx-auto",
      title: "mt-2 text-[14px] sm:text-[12px]",
    },
    sm: {
      wrapper: "aspect-square rounded-lg max-w-[220px] sm:max-w-[260px] mx-auto",
      title: "mt-4 text-[14px] sm:text-[15px]",
    },
    md: {
      wrapper: "relative aspect-[4/3] rounded-[36px] max-w-[360px] sm:max-w-[420px] mx-auto",
      title: "mt-6 sm:mt-7 text-[14px] sm:text-[20px]",
    }
  } as const;

  const s = sizeClasses[size];

  return (
    <Link href={{ pathname: "/sales/[slug]", params: { slug: href } }} className="block group">
      <div
        className={[
          "relative overflow-hidden transition-all duration-300 will-change-transform h-60 w-55 rounded-[70px] shadow-[0_0_10px_rgba(0,0,0,0.1)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]",
          s.wrapper,
          className || "",
        ].join(" ")}
      >
        <Image
          src={bgImage}
          alt=""
          fill
          className="object-cover"
          sizes="(min-width:1024px) 1024px, (min-width:640px) 640px, 100vw"
          priority={priority}
        />

        <div className="absolute inset-0 flex items-start justify-center">
          <h3
            className={[
              s.title,
              "max-w-[80%] text-center font-semibold leading-tight text-gray-900",
              "drop-shadow-[0_1px_0_rgba(255,255,255,0.55)]",
            ].join(" ")}
          >
            {text}
          </h3>
        </div>
      </div>
    </Link>
  );
}

export default OfferCard;