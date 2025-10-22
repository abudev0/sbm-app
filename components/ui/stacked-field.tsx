"use client";

import React from "react";

type Props = {
  label: string;
  children: React.ReactNode;
  className?: string;
  hint?: string;
};

export default function StackedField({ label, children, className = "", hint }: Props) {
  return (
    <div className={["w-full", className].join(" ")}>
      <label className="block text-[15px] font-semibold text-neutral-900 mb-1.5">
        {label}
      </label>
      <div className="w-full rounded-xl border border-neutral-400/90 bg-white px-3 py-2">
        {children}
      </div>
      {hint ? (
        <div className="mt-1.5 text-[12px] text-neutral-500">{hint}</div>
      ) : null}
    </div>
  );
}