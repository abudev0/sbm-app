"use client";

import React from "react";

export type PaymentTab = "card" | "cash";

export default function PaymentToggle({
  value,
  onChange,
  className = "",
}: {
  value: PaymentTab;
  onChange: (v: PaymentTab) => void;
  className?: string;
}) {
  const baseBtn =
    "flex-1 inline-flex items-center justify-center rounded-xl text-[16px] font-medium h-10 transition";
  const active = "bg-white text-neutral-900 shadow-sm";
  const inactive = "bg-white text-neutral-800 border border-neutral-200";

  return (
    <div className={["w-full max-w-[520px]", className].join(" ")}>
      <div className="flex rounded-2xl bg-neutral-100 p-1">
        <button
          type="button"
          className={[baseBtn, value === "card" ? active : inactive].join(" ")}
          onClick={() => onChange("card")}
        >
          Karta
        </button>
        <button
          type="button"
          className={[baseBtn, value === "cash" ? active : inactive].join(" ")}
          onClick={() => onChange("cash")}
        >
          Naqd
        </button>
      </div>
    </div>
  );
}