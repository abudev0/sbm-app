"use client";

import Image from "next/image";

type Marker = { id: number; top: string; left: string; title?: string };

const markers: Marker[] = [
  { id: 1, top: "52%", left: "76.5%" },
  { id: 2, top: "57%", left: "90%" },
  { id: 3, top: "82%", left: "66%" },
  { id: 4, top: "60%", left: "58%" },
  { id: 5, top: "38%", left: "48%" },
  { id: 6, top: "49%", left: "40%" },
  { id: 7, top: "28%", left: "23%" },
  { id: 8, top: "20%", left: "10%" },
  { id: 9, top: "72%", left: "58%" },
];

export function UzbMap() {
  return (
    <div className="relative w-full aspect-[4/3]">
      <Image
        src="/uzbekistan-map.png"
        alt="Uzbekistan map"
        fill
        className="object-contain"
        priority={false}
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {markers.map((m) => (
        <span
          key={m.id}
          title={m.title ?? `Marker ${m.id}`}
          style={{ top: m.top, left: m.left }}
          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center
            h-6 w-6 md:h-8 md:w-8 rounded-full bg-[#7CC04B] text-white !text-[20px] !md:text-[13px]
            font-bold "
          aria-label={`Point ${m.id}`}
        >
          {m.id}
        </span>
      ))}
    </div>
  );
}