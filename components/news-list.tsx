"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import type { NewsItem } from "@/lib/api/news"
import { Link } from "@/i18n/routing"

export function NewsList({ items }: { items: NewsItem[] }) {
  const locale = useLocale() as 'uz'|'ru'

  return (
    <ul className="space-y-4">
      {items.map(n => {
        const title = typeof n.title === "string"
          ? n.title
          : (n.title as any)[locale] || (n.title as any).uz
        const description = typeof n.description === "string"
          ? n.description
          : (n.description as any)[locale] || (n.description as any).uz

        return (
          <li key={n.id} className="p-3 sm:p-4 ">
            <Link
              href={{ pathname: "/news/[slug]", params: { slug: n.slug } }}
              className="flex gap-4 flex-col sm:flex-row"
            >
              <div className="relative h-32 w-full sm:h-40 sm:w-60 rounded overflow-hidden border border-gray-300">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${n.image}`}
                  alt={title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 h-32 sm:h-40 flex flex-col justify-between">
                <p className="mt-2 text-[16px] sm:text-[18px] text-black line-clamp-3">
                  {description}
                </p>
                <p className="mt-2 text-[11px] text-gray-400 self-end">
                  {new Date(n.publishedAt).toLocaleDateString(locale, {
                    day: "2-digit", month: "long", year: "numeric"
                  })}
                </p>
              </div>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}