"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Props = {
  images?: string[];
};

export default function ProductGallery({ images = [] }: Props) {
  const raw = images?.length ? images : ["/placeholder.png"];

  // Normalize to absolute URLs
  const [urls, setUrls] = useState<string[]>([]);
  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || "";
    const toFull = (rel: string) => {
      if (!rel) return "/placeholder.png";
      if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
      if (!base) return rel;
      return base.replace(/\/+$/, "") + "/" + rel.replace(/^\/+/, "");
    };
    setUrls(raw.map(toFull));
  }, [raw]);

  // Layout
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [slideW, setSlideW] = useState(0);

  // Measure inner viewport (no padding)
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const ro = new ResizeObserver(() => setSlideW(vp.clientWidth));
    ro.observe(vp);
    setSlideW(vp.clientWidth);
    return () => ro.disconnect();
  }, []);

  // Index + drag
  const [index, setIndex] = useState(0);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const [dx, setDx] = useState(0);
  const dxRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [animate, setAnimate] = useState(true);

  // Clamp when urls length changes
  useEffect(() => {
    if (index >= urls.length) setIndex(Math.max(0, urls.length - 1));
  }, [urls.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reset transient offset when index changes
  useEffect(() => {
    setDx(0);
    dxRef.current = 0;
    setAnimate(true);
  }, [index]);

  const clamp = (i: number) => (i < 0 ? 0 : i >= urls.length ? urls.length - 1 : i);

  // Pointer handlers
  function onPointerDown(e: React.PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointerIdRef.current = e.pointerId;
    try {
      (e.target as Element).setPointerCapture(e.pointerId);
    } catch {}
    startXRef.current = e.clientX;
    dxRef.current = 0;
    setDragging(true);
    setAnimate(false);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging || pointerIdRef.current !== e.pointerId) return;
    const curr = e.clientX - startXRef.current;
    dxRef.current = curr;
    setDx(curr);
  }
  function endDrag() {
    if (!dragging) return;
    setDragging(false);
    setAnimate(true);
    const threshold = Math.max(40, slideW * 0.18);
    if (dxRef.current > threshold) {
      setIndex((i) => clamp(i - 1));
    } else if (dxRef.current < -threshold) {
      setIndex((i) => clamp(i + 1));
    } else {
      setDx(0);
      dxRef.current = 0;
    }
    pointerIdRef.current = null;
  }

  // Keyboard navigation
  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") {
      setIndex((i) => clamp(i - 1));
    } else if (e.key === "ArrowRight") {
      setIndex((i) => clamp(i + 1));
    }
  }

  // Transform
  const baseX = -(index * slideW);
  const translateX = baseX + dx;
  const trackStyle: React.CSSProperties = {
    width: slideW ? urls.length * slideW : undefined,
    transform: `translate3d(${translateX || 0}px, 0, 0)`,
    transition: animate ? "transform 300ms cubic-bezier(.2,.9,.2,1)" : "none",
  };

  const slideStyle: React.CSSProperties = slideW ? { width: slideW } : { width: "100%" };

  const atStart = index === 0;
  const atEnd = index === urls.length - 1;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md">
      <div
        ref={viewportRef}
        className="relative w-full max-w-[720px] mx-auto rounded-xl overflow-hidden bg-white outline-none"
        style={{ aspectRatio: "3 / 4", touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseLeave={() => dragging && endDrag()}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="region"
        aria-label="Product images carousel"
      >
        {/* Track */}
        <div className="h-full flex items-center" style={trackStyle}>
          {urls.map((src, i) => (
            <div
              key={`slide-${i}`}
              className="h-full flex-shrink-0 flex items-center justify-center"
              style={{ ...slideStyle, padding: "0.75rem" }}
            >
              {/* Big centered image area */}
              <div className="relative w-[80%] h-[80%] sm:w-[65%] sm:h-[85%]">
                <Image
                  src={src || "/placeholder.png"}
                  alt={`Image ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 80vw, 720px"
                  unoptimized
                  priority={i === 0}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Navigation buttons (no loop, disabled at edges). Hidden if single image */}
        {urls.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => setIndex((i) => clamp(i - 1))}
              disabled={atStart}
              className={[
                "absolute left-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow",
                atStart ? "opacity-40 cursor-not-allowed" : "hover:bg-white",
              ].join(" ")}
            >
              <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Next image"
              onClick={() => setIndex((i) => clamp(i + 1))}
              disabled={atEnd}
              className={[
                "absolute right-3 top-1/2 -translate-y-1/2 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/90 shadow",
                atEnd ? "opacity-40 cursor-not-allowed" : "hover:bg-white",
              ].join(" ")}
            >
              <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {urls.map((_, i) => (
          <button
            key={`dot-${i}`}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${i + 1}`}
            className={`h-2 rounded-full transition-all ${
              i === index ? "bg-amber-400 w-8" : "bg-gray-300/60 w-6"
            }`}
          />
        ))}
      </div>
    </div>
  );
}