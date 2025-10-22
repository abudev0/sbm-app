"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type DropdownItem = { value: string; label: string };

export default function InlineDropdown({
  items,
  value,
  onChange,
  placeholder = "Tanlang",
  disabled = false,
  className = "",
  menuClassName = "",
  size = "md", // sm | md
}: {
  items: DropdownItem[];
  value?: string;
  onChange?: (v: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  size?: "sm" | "md";
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const selectedIndex = useMemo(
    () => items.findIndex((i) => i.value === value),
    [items, value]
  );
  const selected = selectedIndex >= 0 ? items[selectedIndex] : undefined;

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (!rootRef.current) return;
      if (rootRef.current.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : Math.min(0, items.length - 1));
    }
  }, [open, selectedIndex, items.length]);

  useLayoutEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function commit(idx: number) {
    const it = items[idx];
    if (!it) return;
    onChange?.(it.value);
    setOpen(false);
    btnRef.current?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btnRef.current?.focus();
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(items.length - 1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(items.length - 1, (i < 0 ? 0 : i) + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, (i < 0 ? 0 : i) - 1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) commit(activeIndex);
      return;
    }
  }

  const sizeMap = {
    sm: { padY: "py-1.5", txt: "text-[13px]" },
    md: { padY: "py-2", txt: "text-[14px]" },
  } as const;
  const { padY, txt } = sizeMap[size];

  return (
    <div ref={rootRef} className={["relative", className].join(" ")}>
      <button
        ref={btnRef}
        type="button"
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onKeyDown}
        className={[
          "w-full pr-7 text-left bg-transparent focus:outline-none",
          txt,
          padY,
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
        ].join(" ")}
      >
        <span className={selected ? "text-neutral-900" : "text-neutral-400 font-medium"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
      </button>

      {open && (
        <div
          className={[
            "absolute left-0 top-[calc(100%+4px)] z-[100] w-full rounded-xl border border-neutral-200 bg-white shadow-md",
            menuClassName,
          ].join(" ")}
        >
          <ul
            ref={listRef}
            role="listbox"
            aria-activedescendant={activeIndex >= 0 ? `dd-opt-${activeIndex}` : undefined}
            className="max-h-64 overflow-auto py-1"
            onKeyDown={onKeyDown}
            tabIndex={-1}
          >
            {items.map((it, idx) => {
              const isActive = idx === activeIndex;
              const isSelected = it.value === value;
              return (
                <li
                  id={`dd-opt-${idx}`}
                  key={it.value}
                  data-idx={idx}
                  role="option"
                  aria-selected={isSelected}
                  className={[
                    "flex items-center justify-between px-3 py-2 text-[14px]",
                    isActive ? "bg-neutral-100" : "",
                    isSelected ? "text-neutral-900 font-medium" : "text-neutral-700",
                    "cursor-pointer",
                  ].join(" ")}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => commit(idx)}
                >
                  <span>{it.label}</span>
                  {isSelected ? <Check className="h-4 w-4 text-neutral-600" /> : null}
                </li>
              );
            })}
            {items.length === 0 && (
              <li className="px-3 py-2 text-[13px] text-neutral-500">Hech narsa topilmadi</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}