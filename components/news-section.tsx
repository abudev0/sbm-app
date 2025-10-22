"use client"

import Image from "next/image"
import { useCallback, useEffect, useRef, useState } from "react"
import type { NewsItem } from "@/lib/api/news"
import { useLocale } from "next-intl"
import { Link } from "@/i18n/routing"

type Props = {
  items: NewsItem[]
  interval?: number
}

export function NewsCarousel({ items, interval = 3000 }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(0)
  const [pagesCount, setPagesCount] = useState(1)
  const [centerIdx, setCenterIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const locale = useLocale() as "uz" | "ru" | "en"

  const getMetrics = useCallback(() => {
    const el = trackRef.current
    if (!el) return { step: 0, gap: 16, visible: 1, cardW: 0 }
    const first = el.querySelector<HTMLElement>("[data-news-card]")
    const styles = window.getComputedStyle(el)
    const gap = parseFloat((styles as any).columnGap || styles.gap || "16") || 16
    const cardW = first ? first.getBoundingClientRect().width : el.clientWidth
    const step = cardW + gap
    const visible = Math.max(1, Math.round((el.clientWidth + gap) / step))
    return { step, gap, visible, cardW }
  }, [])

  const updateState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { step, visible, cardW } = getMetrics()
    if (!step) return
    const positions = Math.max(1, items.length - visible + 1)
    setPagesCount(positions)
    const leftIdx = Math.round(el.scrollLeft / step)
    setPage(Math.min(positions - 1, Math.max(0, leftIdx)))
    const center = Math.round((el.scrollLeft + el.clientWidth / 2 - cardW / 2) / step)
    setCenterIdx(Math.min(items.length - 1, Math.max(0, center)))
  }, [getMetrics, items.length])

  useEffect(() => {
    updateState()
    const el = trackRef.current
    if (!el) return
    const onScroll = () => updateState()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateState)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [updateState])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const el = trackRef.current
      if (!el) return
      const { step } = getMetrics()
      if (!step) return
      const maxLeft = el.scrollWidth - el.clientWidth
      const nextLeft = Math.min(maxLeft, Math.round(el.scrollLeft + step))
      if (nextLeft >= maxLeft) {
        el.scrollTo({ left: 0, behavior: "auto" })
      } else {
        el.scrollTo({ left: nextLeft, behavior: "smooth" })
      }
    }, interval)
    return () => clearInterval(id)
  }, [getMetrics, paused, interval])

  const gotoPage = (p: number) => {
    const el = trackRef.current
    if (!el) return
    const { step } = getMetrics()
    el.scrollTo({ left: p * step, behavior: "smooth" })
  }

  // Drag / Click separation
  const dragging = useRef(false)
  const movedRef = useRef(false)
  const startX = useRef(0)
  const startLeft = useRef(0)

  const endDrag = () => {
    const el = trackRef.current
    if (!el) return
    dragging.current = false
    el.style.scrollBehavior = ""
    document.body.style.userSelect = ""
    const { step } = getMetrics()
    const idx = Math.round(el.scrollLeft / step)
    el.scrollTo({ left: idx * step, behavior: "smooth" })
    setTimeout(() => setPaused(false), 800)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current
    if (!el) return
    dragging.current = true
    movedRef.current = false
    setPaused(true)
    startX.current = e.clientX
    startLeft.current = el.scrollLeft
    el.style.scrollBehavior = "auto" // во время drag — без smooth
    document.body.style.userSelect = "none" // приятнее тянуть на десктопе
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const el = trackRef.current
    if (!el) return
    const dx = e.clientX - startX.current
    if (Math.abs(dx) > 5) movedRef.current = true // считаем это drag, а не клик
    el.scrollLeft = startLeft.current - dx
  }

  const onPointerUp = () => {
    if (!dragging.current) return
    endDrag()
  }

  const onPointerCancel = () => {
    if (!dragging.current) return
    endDrag()
  }

  const displayItems = items.map(it => {
    if (typeof it.title === "string") return it
    const langTitle = (it.title as any)[locale] || (it.title as any).uz
    const langDesc = (it.description as any)[locale] || (it.description as any).uz
    return { ...it, title: langTitle, description: langDesc }
  })

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          {locale === "ru" ? "Новости" : locale === "en" ? "News" : "Yangiliklar"}
        </h2>
        <Link
          href={`/news`}
          className="text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          {locale === "ru" ? "Все" : locale === "en" ? "View all" : "Barchasi"} →
        </Link>
      </div>

      <div
        ref={trackRef}
        className="
          no-scrollbar flex items-stretch overflow-x-auto
          snap-x snap-mandatory gap-4 py-2 scroll-smooth
          cursor-grab active:cursor-grabbing
        "
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onWheel={(e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            (e.currentTarget as HTMLDivElement).scrollLeft += e.deltaY
          }
        }}
      >
        {displayItems.map((n, i) => {
          const slug = n.slug || n.id
          const isCenter = i === centerIdx
          return (
            <Link
              href={{ pathname: "/news/[slug]", params: { slug } }}
              key={n.id}
              data-news-card
              onClick={(e) => {
                // если был drag — блокируем навигацию
                if (dragging.current || movedRef.current) {
                  e.preventDefault()
                }
              }}
              className="
                snap-start shrink-0
                basis-full
                sm:basis-[calc((100%-1*1rem)/2)]
                md:basis-[calc((100%-2*1rem)/3)]
                lg:basis-[calc((100%-3*1rem)/4)]
                xl:basis-[calc((100%-4*1rem)/5)]
              "
            >
              <div
                className={[
                  "relative rounded-[22px] overflow-hidden aspect-[16/7] shadow-sm",
                  "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  isCenter ? "scale-100 opacity-100" : "scale-[0.97] opacity-90",
                ].join(" ")}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')}/${String(n.image).replace(/^\/+/, '')}`}
                  alt={typeof n.title === "string" ? n.title : "News"}
                  fill
                  className="object-cover"
                  sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, (min-width:640px) 50vw, 100vw"
                  priority={i < 2}
                />
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-3 flex justify-center">
        <div className="flex items-center gap-2">
          {Array.from({ length: pagesCount }).map((_, idx) => (
            <button
              key={idx}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => gotoPage(idx)}
              className={
                idx === page
                  ? "h-1.5 w-6 rounded-full bg-amber-400 transition-all"
                  : "h-1.5 w-1.5 rounded-full bg-gray-300"
              }
            />
          ))}
        </div>
      </div>
    </section>
  )
}