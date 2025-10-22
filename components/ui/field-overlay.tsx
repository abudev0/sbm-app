"use client";

import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
  // Label ostidagi fon (gradient fon ustida kesilish uchun oq qoplama)
  labelBgClassName?: string; // default: bg-white
  labelClassName?: string;
  ruleClassName?: string; // chiziq rangi
  innerClassName?: string; // ichki joy
};

/**
 * FieldOverlay — borderli quti ustida "oq fonli" label va o‘ngiga chiziq.
 * Rasmga yaqin: label ≈16px, semibold; border aniq, radius yumaloq.
 */
export default function FieldOverlay({
  label,
  children,
  className = "",
  labelBgClassName = "bg-white",
  labelClassName = "",
  ruleClassName = "bg-neutral-300",
  innerClassName = "",
}: Props) {
  return (
    <div className={["relative", className].join(" ")}>
      {/* Borderli quti */}
      <div
        className={[
          "rounded-[12px] border border-neutral-400 bg-white",
          // label uchun ustki joy: pt-4 (label yarim tashqarida turadi)
          "px-4 pt-5 pb-2.5 min-h-[56px]",
          innerClassName,
        ].join(" ")}
      >
        {/* Overlay label (border ustida oq parchali) */}
        <div className="pointer-events-none absolute -top-3 left-4 right-4 flex items-center gap-2">
          <span
            className={[
              "inline-block rounded-[3px] px-1.5",
              labelBgClassName,
              "text-[16px] leading-[18px] font-semibold text-neutral-900",
              labelClassName,
            ].join(" ")}
          >
            {label}
          </span>
          <span className={["h-[2px] flex-1 rounded-full", ruleClassName].join(" ")} />
        </div>

        {/* Control joyi */}
        {children}
      </div>
    </div>
  );
}