"use client";

import { ChevronDown } from "lucide-react";
import React from "react";

export default function AccordionCard({
  open,
  onToggle,
  title,
  subtitle,
  icon,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-[#FFF2CC] p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3"
        aria-expanded={open}
      >
        <div className="flex items-center gap-2 text-left">
          {icon ? <span className="shrink-0">{icon}</span> : null}
          <div>
            <div className="text-[15px] font-semibold text-neutral-900">{title}</div>
            {subtitle ? <div className="text-[12px] text-neutral-600">{subtitle}</div> : null}
          </div>
        </div>
        <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">{children}</div>}
    </div>
  );
}