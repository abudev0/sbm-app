"use client";
import { useState } from "react";
import { Star } from "lucide-react";

export function RatingStars({
  initial = 0,
  onChange,
  size = 24,
  className,
}: {
  initial?: number;
  onChange?: (val: number) => void;
  size?: number;
  className?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const [value, setValue] = useState<number>(initial);

  const current = hover ?? value;

  return (
    <div className={["inline-flex items-center gap-1", className || ""].join(" ")}>
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= current;
        return (
          <button
            key={i}
            type="button"
            aria-label={`Rate ${i}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => {
              setValue(i);
              onChange?.(i);
            }}
            className="p-0.5 rounded hover:scale-110 transition"
          >
            <Star
              width={size}
              height={size}
              className={filled ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
              strokeWidth={1.5}
              fill={filled ? "#FFD600" : "none"}
            />
          </button>
        );
      })}
    </div>
  );
}