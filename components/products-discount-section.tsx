"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { ProductCard } from "@/components/ui/product-card"
import { Link } from "@/i18n/routing"
import type { ProductEntity } from "@/lib/api/products"

type Props = { items: ProductEntity[] }

function resolveText(map?: { uz?: string; ru?: string }, locale?: string) {
  if (!map) return ""
  const isRu = locale?.toLowerCase().startsWith("ru")
  return isRu ? (map.ru || map.uz || "") : (map.uz || map.ru || "")
}

function pickImage(p: ProductEntity): string {
  const direct = (p as any).image || (p as any).img
  if (typeof direct === "string" && direct) return direct
  if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0] as any
    if (typeof first === "string") return first
    if (first && typeof first.img === "string") return first.img
  }
  return "/placeholder.png"
}

/** Percent chegirma bo‘lsa final/old narxni izchil hisoblash */
function computePrice(basePrice?: number, discountPercent?: number, oldPriceInput?: number) {
  const base = Number(basePrice) || 0
  const d = Math.max(0, Math.min(100, Number(discountPercent) || 0))
  if (!base) return { final: 0, old: undefined as number | undefined, percent: 0 }
  const hasDiscount = d > 0
  const final = hasDiscount ? Math.round(base * (1 - d / 100)) : base
  const old = hasDiscount ? base : (typeof oldPriceInput === "number" ? oldPriceInput : undefined)
  return { final, old, percent: d }
}

export function ProductsDiscountSection({ items }: Props) {
  const t = useTranslations("DiscountProductsSection")
  const locale = useLocale()
  const products = useMemo(() => items ?? [], [items])

  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const EPS = 1
    setAtStart(scrollLeft <= EPS)
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS)
  }, [])

  useEffect(() => {
    updateEdges()
    const el = trackRef.current
    if (!el) return
    const onScroll = () => updateEdges()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [updateEdges])

  const scrollByCard = useCallback((dir: "prev" | "next") => {
    const track = trackRef.current
    if (!track) return
    const firstCard = track.querySelector<HTMLElement>("[data-product-card]")
    const styles = window.getComputedStyle(track)
    const gap = parseFloat((styles as any).columnGap || styles.gap || "16") || 16
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth
    track.scrollBy({ left: dir === "next" ? cardWidth : -cardWidth, behavior: "smooth" })
  }, [])

  if (!products.length) return null

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
        <Link href={"/products"} className="text-gray-600 hover:text-gray-800 font-medium text-sm" aria-label={t("viewAllAria")}>
          {t("viewAll")} →
        </Link>
      </div>

      <div ref={viewportRef} className="relative overflow-hidden outline-none" tabIndex={0} aria-label={t("title")}>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-12 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-12 to-transparent" />

        <div className="flex items-center gap-0 sm:gap-2">
          <button
            type="button"
            aria-label={t("prevAria")}
            onClick={() => scrollByCard("prev")}
            className={`group p-0.5 sm:p-1 shrink-0 transition-transform hover:scale-110 focus:outline-none ${atStart ? "opacity-40 pointer-events-none" : ""}`}
          >
            <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7 text-gray-800 group-hover:text-gray-900" />
          </button>

          <div
            ref={trackRef}
            className="no-scrollbar flex-1 flex items-stretch overflow-x-auto scroll-smooth snap-x snap-mandatory gap-4 py-2"
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY
            }}
          >
            {products.map((p) => {
              const nameUzOrRu = resolveText(p.name, locale) || p.slug || String(p.id)
              const nameRu = resolveText(p.name, "ru") || p.slug || String(p.id)

              // SLUG fallback: muhim
              const slug = p.slug || String(p.id)

              const img = pickImage(p)

              const { final, old, percent } = computePrice(
                Number((p as any).price),
                Number((p as any).discountPercent ?? (p as any).discount),
                typeof (p as any).oldPrice === "number" ? (p as any).oldPrice : undefined
              )

              return (
                <div
                  key={slug}
                  data-product-card
                  className="
                    snap-start shrink-0
                    basis-[calc((100%-1*1rem)/2)]
                    md:basis-[calc((100%-2*1rem)/3)]
                    xl:basis-[calc((100%-3*1rem)/4)]
                  "
                >
                  <ProductCard
                    slug={slug}
                    name={nameUzOrRu}
                    nameRu={nameRu}
                    price={final}
                    oldPrice={old}
                    discountPercent={percent || undefined}
                    image={img}
                    rating={(p as any).rating ?? 0}
                    sold={(p as any).sold}
                    pQuantity={(p as any).pQuantity ?? (p as any).stock}
                    attributes={((p as any).attributes || []).slice(0, 3)}
                  />
                </div>
              )
            })}
          </div>

          <button
            type="button"
            aria-label={t("nextAria")}
            onClick={() => scrollByCard("next")}
            className={`group p-0.5 sm:p-1 shrink-0 transition-transform hover:scale-110 focus:outline-none ${atEnd ? "opacity-40 pointer-events-none" : ""}`}
          >
            <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7 text-gray-800 group-hover:text-gray-900" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default ProductsDiscountSection
