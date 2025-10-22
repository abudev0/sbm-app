"use client"

import { useLocale, useTranslations } from "next-intl"
import { ProductCard } from "@/components/ui/product-card"
import { Link } from "@/i18n/routing"
import { useRef, useState, useCallback, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

export interface CarouselItem {
  slug: string;
  name: string;
  nameRu: string;
  price: number;
  image: string;
  rating: number;
  oldPrice?: number;
  discountPercent?: number;
  attributes?: string[];
}

export interface ProductsCarouselProps {
  title: string;
  viewAllHref?: { pathname: string; query?: Record<string, any> };
  viewAllLabel?: string;
  items: CarouselItem[];
  variant?: "grid" | "carousel"; // new prop
}

export function ProductsCarousel({ title, viewAllHref, viewAllLabel, items, variant = "carousel" }: ProductsCarouselProps) {
  const tSec = useTranslations("ProductsSection")
  const locale = useLocale()
  const isRu = locale?.toLowerCase().startsWith("ru")

  // Carousel state only if needed
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [atStart, setAtStart] = useState(true)
  const [atEnd, setAtEnd] = useState(false)

  const updateEdges = useCallback(() => {
    if (variant === "grid") return
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const EPS = 1
    setAtStart(scrollLeft <= EPS)
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS)
  }, [variant])

  useEffect(() => {
    if (variant === "grid") return
    updateEdges()
    const el = trackRef.current
    if (!el) return
    const onScroll = () => updateEdges()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateEdges)
    ro.observe(el)
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect() }
  }, [updateEdges, variant])

  const scrollByCard = useCallback((dir: "prev" | "next") => {
    if (variant === "grid") return
    const track = trackRef.current
    if (!track) return
    const firstCard = track.querySelector<HTMLElement>("[data-product-card]")
    const styles = window.getComputedStyle(track)
    const gap = parseFloat((styles as any).columnGap || (styles as any).gap || "12") || 12
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width + gap : track.clientWidth
    track.scrollBy({ left: dir === "next" ? cardWidth : -cardWidth, behavior: "smooth" })
  }, [variant])

  useEffect(() => {
    if (variant === "grid") return
    const vp = viewportRef.current
    if (!vp) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") scrollByCard("next")
      if (e.key === "ArrowLeft") scrollByCard("prev")
    }
    vp.addEventListener("keydown", onKey)
    return () => vp.removeEventListener("keydown", onKey)
  }, [scrollByCard, variant])

  return (
    <section className="container mx-auto px-2 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
        {viewAllHref && viewAllLabel && (
          <Link
            href={viewAllHref as any}
            className="text-gray-600  font-medium text-sm"
            aria-label={tSec("viewAllAria")}
          >
            {viewAllLabel} →
          </Link>
        )}
      </div>
      {variant === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p, i) => {
            const label = isRu ? p.nameRu : p.name
            const price = p.price
            return (
              <ProductCard
                key={p.slug + i}
                name={label}
                nameRu={p.nameRu}
                price={price}
                image={p.image}
                rating={p.rating}
                slug={p.slug}
                oldPrice={p.oldPrice}
                discountPercent={p.discountPercent}
                compact
                attributes={p.attributes || []}
              />
            )
          })}
        </div>
      )}
      {variant === "carousel" && (
        <div ref={viewportRef} className="relative overflow-hidden outline-none" tabIndex={0} aria-label={title}>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label={tSec("prevAria")}
              onClick={() => scrollByCard("prev")}
              className={`group p-1 shrink-0 transition-transform  focus:outline-none ${atStart ? "opacity-40 pointer-events-none" : ""}`}
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <div
              ref={trackRef}
              className="no-scrollbar flex-1 flex items-stretch overflow-x-auto scroll-smooth snap-x snap-mandatory gap-3 py-1.5 px-3"
              style={{ scrollPaddingInline: 12 }}
              onWheel={(e) => { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) e.currentTarget.scrollLeft += e.deltaY }}
            >
              {items.map((p, i) => {
                const label = isRu ? p.nameRu : p.name
                p.price
                return (
                  <div
                    key={p.slug + i}
                    data-product-card
                    className="snap-start shrink-0 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/4 max-w-[320px]"
                  >
                    <ProductCard
                      name={label}
                      nameRu={p.nameRu}
                      price={p.price}
                      image={p.image}
                      rating={p.rating}
                      slug={p.slug}
                      oldPrice={p.oldPrice}
                      discountPercent={p.discountPercent}
                      compact
                      attributes={p.attributes || []}
                    />
                  </div>
                )
              })}
            </div>
            <button
              type="button"
              aria-label={tSec("nextAria")}
              onClick={() => scrollByCard("next")}
              className={`group shrink-0 transition-transform focus:outline-none ${atEnd ? "opacity-40 pointer-events-none" : ""}`}
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>
      )}
    </section>
  )
}


export default ProductsCarousel
