"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { useState } from "react"
import { Link } from "@/i18n/routing"

export interface BrandCardProps {
  name: string
  nameRu: string
  logo: string
  className?: string
  slug?: string          // ixtiyoriy: agar bersang link bo'ladi
  ariaLabel?: string     // ixtiyoriy: ustiga yozmoqchi bo'lsang
  fallbackLogo?: string  // ixtiyoriy fallback rasm (default placeholder)
}

export function BrandCard({
  name,
  logo,
  className,
  slug,
  ariaLabel,
  fallbackLogo = "/placeholder.svg",
}: BrandCardProps) {
  const locale = useLocale()
  const isRu = locale?.toLowerCase().startsWith("ru")
  const label = ariaLabel || (isRu ? (name) : (name || name))
  const [imgSrc, setImgSrc] = useState(logo)

  const content = (
    <div
      className={[
        // ASL STYLING — O'ZGARMAGAN
        "bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-2",
        "grid grid-cols-2 items-center gap-4 transition-shadow cursor-pointer",
        className || "",
      ].join(" ")}
      aria-label={label}
    >
      <Image
        src={`${imgSrc}`}
        alt={label}
        width={64}
        height={64}
        className="size-full"
      />
      <div>
        <h3 className="font-semibold text-gray-800 text-base sm:text-lg">
          {label}
        </h3>
      </div>
    </div>
  )

  if (slug) {
    // Link qo'yish stylingni buzmaydi
    return (
      <Link
        href={{pathname:'/brands/[slug]', params:{slug}}}
        aria-label={label}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl"
      >
        {content}
      </Link>
    )
  }

  return content
}