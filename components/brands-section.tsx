"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { BrandCard } from "@/components/ui/brand-card";
import { Link } from "@/i18n/routing";
import { useMemo, useRef, useCallback, useEffect, useState } from "react";
import { BrandSliderItem } from "@/lib/api/brand";

type Props = {
  brands: BrandSliderItem[];
  autoplay?: boolean;
  interval?: number;
  pauseOnHover?: boolean;   
  loop?: boolean;   
};

export function BrandsSectionSlider({
  brands,
  autoplay = true,
  interval = 3000,
  pauseOnHover = true,
  loop = true
}: Props) {
  const t = useTranslations("BrandsSection");
  const locale = useLocale();
  // Faqat uz/ru
  const loc = (locale?.toLowerCase().startsWith("ru") ? "ru" : "uz") as "uz" | "ru";

  const localized = useMemo(
    () =>
      (brands || []).map((b) => ({
        ...b,
        displayName: b.title || b.name?.[loc] || b.slug,
        displayNameRu: b.name?.ru || b.title || b.slug,
      })),
    [brands, loc]
  );

  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const pauseRef = useRef(false);
  const userInteractedRef = useRef(false);
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const EPS = 1;
    setAtStart(scrollLeft <= EPS);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - EPS);
  }, []);

  const scrollByCards = useCallback((dir: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const firstCard = track.querySelector<HTMLElement>("[data-brand-card]");
    const styles = window.getComputedStyle(track);
    const gap = parseFloat((styles as any).columnGap || (styles as any).gap || "16") || 16;
    const cardWidth = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : track.clientWidth;
    track.scrollBy({
      left: dir === "next" ? cardWidth : -cardWidth,
      behavior: "smooth",
    });
  }, []);

  const scrollToStart = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    updateEdges();
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [updateEdges]);

  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        userInteractedRef.current = true;
        scrollByCards("next");
        scheduleRestart();
      }
      if (e.key === "ArrowLeft") {
        userInteractedRef.current = true;
        scrollByCards("prev");
        scheduleRestart();
      }
    };
    vp.addEventListener("keydown", onKey);
    return () => vp.removeEventListener("keydown", onKey);
  }, [scrollByCards]);

  useEffect(() => {
    if (!pauseOnHover) return;
    const el = trackRef.current;
    if (!el) return;
    const onEnter = () => { pauseRef.current = true; };
    const onLeave = () => { pauseRef.current = false; };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [pauseOnHover]);

  function scheduleRestart() {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
    pauseRef.current = true;
    restartTimeoutRef.current = setTimeout(() => {
      pauseRef.current = false;
      userInteractedRef.current = false;
    }, 5000);
  }

  useEffect(() => {
    if (!autoplay) return;
    if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);

    autoIntervalRef.current = setInterval(() => {
      if (pauseRef.current) return;
      const el = trackRef.current;
      if (!el) return;

      const { scrollLeft, clientWidth, scrollWidth } = el;
      const atListEnd = scrollLeft + clientWidth >= scrollWidth - 4;

      if (atListEnd) {
        if (loop) {
          scrollToStart();
        }
        return;
      }
      scrollByCards("next");
    }, interval);

    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [autoplay, interval, loop, scrollByCards, scrollToStart]);

  if (!localized.length) {
    return (
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("title")}</h2>
        <div className="text-sm text-gray-500">
          {t("empty", { default: "Brendlar mavjud emas" })}
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{t("title")}</h2>
        <Link
          href={{ pathname: "/brands" }}
          className="text-gray-600  font-medium text-sm"
          aria-label={t("viewAllAria")}
        >
          {t("viewAll")} →
        </Link>
      </div>

      <div
        ref={viewportRef}
        className="relative overflow-hidden outline-none"
        tabIndex={0}
        aria-label={t("title")}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("prevAria")}
            onClick={() => {
              userInteractedRef.current = true;
              scrollByCards("prev");
              scheduleRestart();
            }}
            className={`group p-1 shrink-0 transition-transform  focus:outline-none ${atStart ? "opacity-40 pointer-events-none" : ""}`}
          >
            <ChevronLeft className="w-7 h-7 text-gray-800 " />
          </button>

          <div
            ref={trackRef}
            className="
              no-scrollbar flex-1 flex items-stretch overflow-x-auto scroll-smooth
              snap-x snap-mandatory gap-4 py-2
            "
            onWheel={(e) => {
              if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                e.currentTarget.scrollLeft += e.deltaY;
              }
              userInteractedRef.current = true;
              scheduleRestart();
            }}
            onScroll={() => {
              userInteractedRef.current = true;
            }}
          >
            {localized.map((brand) => (
              <div
                key={brand.id || brand.slug}
                data-brand-card
                className="
                  snap-start shrink-0
                  basis-full
                  sm:basis-[calc((100%-1*1rem)/2)]
                  lg:basis-[calc((100%-2*1rem)/3)]
                  xl:basis-[calc((100%-3*1rem)/4)]
                "
              >
                <BrandCard
                  name={brand.displayName}
                  nameRu={brand.displayNameRu}
                  slug={brand.slug}
                  logo={brand.img}
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            aria-label={t("nextAria")}
            onClick={() => {
              userInteractedRef.current = true;
              scrollByCards("next");
              scheduleRestart();
            }}
            className={`group p-1 shrink-0 transition-transform focus:outline-none ${atEnd ? "opacity-40 pointer-events-none" : ""}`}
          >
            <ChevronRight className="w-7 h-7 text-gray-800 " />
          </button>
        </div>
      </div>
    </section>
  );
}