"use client";

import { useState } from "react";

export function QuantityControl({
  min = 1,
  max = 99,
  onChange,
}: {
  min?: number;
  max?: number;
  onChange?: (val: number) => void;
}) {
  const [value, setValue] = useState(min);

  function set(val: number) {
    const v = Math.min(max, Math.max(min, val));
    setValue(v);
    onChange?.(v);
  }

  return (
    <div className="inline-flex items-center rounded-xl border border-gray-300 bg-white">
      <button
        type="button"
        onClick={() => set(value - 1)}
        className="px-3 py-2 text-gray-700 hover:bg-gray-50"
        aria-label="decrement"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => set(Number(e.target.value))}
        className="w-12 border-x border-gray-300 py-2 text-center text-sm outline-none"
      />
      <button
        type="button"
        onClick={() => set(value + 1)}
        className="px-3 py-2 text-gray-700 hover:bg-gray-50"
        aria-label="increment"
      >
        +
      </button>
    </div>
  );
}