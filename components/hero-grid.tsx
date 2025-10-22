"use client";

import React, { useEffect, useMemo, useState, TouchEvent } from "react";
import Image from "next/image";

export type HeroCategory = {
  id: string | number;
  title: string;
  img?: string;
  color?: string | null;
  pos?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
};

type Props = { cards: HeroCategory[] };

function Tile({
  card,
  className,
  titleClassName,
}: {
  card: HeroCategory;
  className?: string;
  titleClassName?: string;
}) {
  
  const api = process.env.NEXT_PUBLIC_API_URL;
  const bgUrl = card.img ? `${api}/${card.img}` : undefined;

  return (
    <article
      className={[
        "relative overflow-hidden rounded-2xl",
        "shadow-sm transition-transform ",
        "p-4 sm:p-5",
        className || "",
      ].join(" ")}
      style={{
        backgroundColor: card.color || "#D8B494",
      }}
    >
      <h2
        className={[
          "absolute left-4 top-4 z-10 font-semibold text-white",
          "drop-shadow-[0_1px_8px_rgba(0,0,0,0.top35)]",
          "text-lg sm:text-xl lg:text-2xl",
          "max-w-[70%]",
          titleClassName || "",
        ].join(" ")}
      >
        {card.title}
      </h2>

      {bgUrl && (
        <Image
          src={bgUrl}
          alt={card.title}
          fill
          className="object-contain select-none pointer-events-none z-0 "
          style={{position:"absolute",...card.pos}}
        />
      )}
    </article>
  );
}

export function HeroGrid({ cards }: Props) {
  // ===== MOBILE carousel state =====
  const [current, setCurrent] = useState(0);
  const [auto, setAuto] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // ===== DESKTOP qat'iy joylashuv (rasmga mos) =====
  const DESKTOP_SLOTS = [
    "lg:col-start-1  lg:col-span-3 lg:row-start-1 lg:row-span-1",
    "lg:col-start-4  lg:col-span-3 lg:row-start-1 lg:row-span-1",
    "lg:col-start-7  lg:col-span-6 lg:row-start-1 lg:row-span-1",
    "lg:col-start-1  lg:col-span-6 lg:row-start-2 lg:row-span-2",
    "lg:col-start-7  lg:col-span-3 lg:row-start-2 lg:row-span-1",
    "lg:col-start-10 lg:col-span-3 lg:row-start-2 lg:row-span-1",
    "lg:col-start-7  lg:col-span-6 lg:row-start-3 lg:row-span-1",
  ];

  const TABLET_SLOTS = [
    "md:col-span-3 md:row-span-2",
    "md:col-span-3 md:row-span-2",
    "md:col-span-6 md:row-span-2",
    "md:col-span-6 md:row-span-3",
    "md:col-span-3 md:row-span-1",
    "md:col-span-3 md:row-span-1",
    "md:col-span-6 md:row-span-2",
  ];

  // ===== MOBILE slides: 3 tadan chunk; agar qoldiq 1 bo‘lsa -> 3/4 ko‘rinish =====
  const slides: HeroCategory[][] = useMemo(() => {
    if (cards.length <= 3) return [cards.slice()];
    const chunks: HeroCategory[][] = [];
    for (let i = 0; i < cards.length; i += 3) {
      chunks.push(cards.slice(i, i + 3));
    }
    // 7 ta bo‘lsa: [3,3,1] -> oxirgi 1 ni oldingiga qo‘shamiz => [3,4]
    if (chunks.length > 1 && chunks[chunks.length - 1].length === 1) {
      const last = chunks.pop()!;
      chunks[chunks.length - 1].push(...last);
    }
    return chunks;
  }, [cards]);

  const slidesCount = slides.length;

  useEffect(() => {
    if (!auto || slidesCount <= 1) return;
    const id = window.setInterval(() => setCurrent((p) => (p + 1) % slidesCount), 3500);
    return () => window.clearInterval(id);
  }, [auto, slidesCount]);

  const go = (i: number) => {
    setCurrent(i);
    setAuto(false);
    window.setTimeout(() => setAuto(true), 5000);
  };
  const next = () => go((current + 1) % slidesCount);
  const prev = () => go((current - 1 + slidesCount) % slidesCount);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };
  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const d = touchStartX - touchEndX;
    if (d > 50) next();
    if (d < -50) prev();
    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <section className="py-4 md:py-6 lg:py-8 ">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
        <div className="hidden lg:grid grid-cols-12 gap-3 xl:gap-4 lg:auto-rows-[10rem] xl:auto-rows-[12rem]">
          {Array.from({ length: 7 }).map((_, i) => {
            const card = cards[i] || {
              id: `placeholder-${i}`,
              title: "",
              img: "",
              color: "#D8B494",
            };
            return (
              <Tile
                key={String(card.id)}
                card={card}
                className={[DESKTOP_SLOTS[i], TABLET_SLOTS[i], "min-h-[8rem]"].join(" ")}
              />
            );
          })}
        </div>

        {/* ===== TABLET (md) ===== */}
        <div className="hidden lg:hidden grid-cols-6 gap-3 ">
          {Array.from({ length: 7 }).map((_, i) => {
            const card = cards[i] || {
              id: `placeholder-md-${i}`,
              title: "",
              img: "",
              color: "#D8B494",
            };
            return (
              <Tile
                key={String(card.id)}
                card={card}
                className={[TABLET_SLOTS[i], "min-h-[9.5rem]"].join(" ")}
              />
            );
          })}
        </div>

        {/* ===== MOBILE (<md) — carousel ===== */}
        <div className="block relative lg:hidden">
          <div
            className="relative overflow-hidden rounded-xl"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {slides.map((slideCards, slideIndex) => {
                const isFour = slideCards.length === 4;
                return (
                  <div key={slideIndex} className="w-full flex-shrink-0 p-1">
                    <div className={`grid grid-cols-2 gap-2`}>
                      {slideCards.map((card, idx) => {
                        const isWide = !isFour && idx === 2; // 3 ta bo'lsa 3-chi full width
                        return (
                          <Tile
                            key={String(card.id)}
                            card={card}
                            className={
                              isWide
                                ? "col-span-2 min-h-[120px] md:min-h-[200px] sm:min-h-[180px]"
                                : "col-span-1 min-h-[110px] md:min-h-[200px] sm:min-h-[180px]"
                            }
                            titleClassName={isWide ? "text-xl sm:text-2xl" : "text-base sm:text-lg"}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {slidesCount > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Oldingi slayd"
                className="absolute top-1/2 left-0 z-10 -translate-y-1/2 text-white text-3xl p-2"
              >
                ‹
              </button>
              <button
                onClick={next}
                aria-label="Keyingi slayd"
                className="absolute top-1/2 right-0 z-10 -translate-y-1/2 text-white text-3xl p-2"
              >
                ›
              </button>
              <div className="flex justify-center mt-3 space-x-2">
                {Array.from({ length: slidesCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => go(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === current ? "bg-yellow-100" : "bg-[#FFC52B]"
                    }`}
                    aria-label={`Slayd ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
