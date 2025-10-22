"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  function update() {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  function scrollByPx(px: number) {
    ref.current?.scrollBy({ left: px, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div ref={ref} className="flex gap-3 overflow-x-auto pb-2">
        {children}
      </div>

      {canLeft && (
        <button
          type="button"
          aria-label="scroll left"
          onClick={() => scrollByPx(-360)}
          className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow p-1 border"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          aria-label="scroll right"
          onClick={() => scrollByPx(360)}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-white shadow p-1 border"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}