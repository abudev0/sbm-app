"use client";

import { useEffect, useMemo, useRef, useState, useLayoutEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Search as SearchIcon, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { searchProducts } from "@/lib/api/products";
import { Link, useRouter } from "@/i18n/routing";
import { fetchCategoriesForSearch } from "@/lib/category";

type Category = { _id: string; name?: { uz?: string; ru?: string }; slug?: string };

// Debounce
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setV(value), delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);
  return v;
}



// Anchor rect
function useAnchorRect(anchorRef: React.RefObject<HTMLElement>, deps: any[] = []) {
  const [rect, setRect] = useState({ left: 0, top: 0, bottom: 0, width: 0, height: 0 });

  const measure = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ left: r.left, top: r.top, bottom: r.bottom, width: r.width, height: r.height });
  }, [anchorRef]);

  // Attach listeners and ResizeObserver once (or when the anchor element itself changes)
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const el = anchorRef.current;
    measure();

    const onScroll = () => measure();
    const onResize = () => measure();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    const ro = new ResizeObserver(() => measure());
    if (el) ro.observe(el);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  // re-run only if the measured element reference changes
  }, [measure, anchorRef.current]);

  // Re-measure when caller-provided deps change (doesn't recreate listeners)
  useEffect(() => {
    measure();
    // intentionally depends on caller-supplied deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { rect, measure };
}

function Portal({ children }: { children: React.ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

export default function SearchBar() {
  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const sp = useSearchParams();

  const rootRef = useRef<HTMLDivElement>(null);

  const [openCat, setOpenCat] = useState(false);
  const [cats, setCats] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category | null>(null);
  
  const [q, setQ] = useState("");
  const dq = useDebounced(q, 250);

  const [suggests, setSuggests] = useState<any[]>([]);
  const [showSuggests, setShowSuggests] = useState(false);

  // pass a stable primitive (selected id) so hook deps are stable
  const { rect } = useAnchorRect(rootRef, [openCat, showSuggests, q, selected?._id]);

  useEffect(() => {
    let active = true;
    fetchCategoriesForSearch().then((list) => {
      if (!active) return;
      setCats(list || []);
    });
    return () => {
      active = false;
    };
  }, []);

  // Outside click
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;
      const isInPortal = target.closest('[data-portal="categories"], [data-portal="suggestions"]');
      if (isInPortal) return;
      setOpenCat(false);
      setShowSuggests(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Live suggestions (backend search + optional category)
  useEffect(() => {
    let stop = false;
    const term = dq?.trim();
    if (term && term.length >= 2) {
      searchProducts({ q: term, category: selected?.slug, limit: 5 })
        .then((res) => {
          if (stop) return;
          setSuggests(res.items || []);
          setShowSuggests(true);
        })
        .catch(() => {
          if (stop) return;
          setSuggests([]);
          setShowSuggests(false);
        });
    } else {
      setSuggests([]);
      setShowSuggests(false);
    }
    return () => {
      stop = true;
    };
  }, [dq, selected?.slug]);

  const selectedName = useMemo(() => {
    if (!selected) return t("categories");
    const nm = selected.name;
    if (!nm) return t("categories");
    return locale?.toLowerCase().startsWith("ru")
      ? nm.ru || nm.uz || t("categories")
      : nm.uz || nm.ru || t("categories");
  }, [selected, locale, t]);

  const goSearch = () => {
    const params = new URLSearchParams();

    // Mavjud query’larni saqlab qolamiz (sort, brand, min/max va h.k.)
    sp.forEach((value, key) => {
      // faqat quyidagilarni yangilaymiz:
      if (["q", "category", "page"].includes(key)) return;
      if (value) params.set(key, value);
    });

    if (q.trim()) params.set("q", q.trim());
    // MUHIM: backend `category` paramni kutadi (slug yoki ObjectId)
    if (selected?.slug) params.set("category", selected.slug);
    else params.delete("category");

    params.set("page", "1");

    const queryObj = Object.fromEntries(params.entries()) as Record<string, string>;
    router.push({ pathname: "/products", query: queryObj });

    setOpenCat(false);
    setShowSuggests(false);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch();
    }
    if (e.key === "Escape") {
      setShowSuggests(false);
      setOpenCat(false);
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <div className="group relative flex w-full items-stretch overflow-hidden rounded-lg border border-gray-300 bg-white h-10">
        <button
          className="inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm text-gray-700"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={openCat}
          onClick={() => {
            setOpenCat((v) => !v);
            if (!openCat) setShowSuggests(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpenCat(false);
          }}
        >
          <span className="font-medium truncate max-w-[140px]">{selectedName}</span>
          <ChevronDown className={`h-4 w-4 text-gray-500 shrink-0 transition-transform ${openCat ? "rotate-180" : ""}`} />
        </button>
        <span className="mx-2 my-2 w-px bg-gray-200" aria-hidden />
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t("search")}
            className="h-full w-full bg-white px-3 pr-10 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onInputKeyDown}
            onFocus={() => setShowSuggests(suggests.length > 0)}
            aria-label={t("search")}
          />
          {q && (
            <button
              type="button"
              className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear"
              onClick={() => {
                setQ("");
                setSuggests([]);
                setShowSuggests(false);
              }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            type="button"
            aria-label="Search"
            onClick={goSearch}
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {openCat && (
        <Portal>
          <div
            data-portal="categories"
            className="fixed z-[1000] mt-1 rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            role="listbox"
            style={{ left: rect.left, top: rect.bottom + 4, width: rect.width }}
          >
            <div className="max-h-80 overflow-auto text-sm">
              <button
                type="button"
                className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${!selected ? "text-amber-600 font-medium" : "text-gray-800"}`}
                onClick={() => {
                  setSelected(null);
                  setOpenCat(false);
                }}
              >
                {t("allCategories", { default: "Barcha kategoriyalar" })}
              </button>
              {cats.map((c) => {
                const nm = c.name || {};
                const label = locale?.toLowerCase().startsWith("ru") ? nm.ru || nm.uz || "" : nm.uz || nm.ru || "";
                const isActive = selected?._id === c._id;                
                return (
                  <button
                    key={c._id}
                    type="button"
                    className={`block w-full text-left px-3 py-2 hover:bg-gray-50 ${isActive ? "text-amber-600 font-medium" : "text-gray-800"}`}
                    onClick={() => {
                      setSelected(c);
                      setOpenCat(false);
                    }}
                  >
                    {label || c.slug || c._id}
                  </button>
                );
              })}
            </div>
          </div>
        </Portal>
      )}

      {showSuggests && suggests.length > 0 && (
        <Portal>
          <div
            data-portal="suggestions"
            className="fixed z-[999] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden"
            style={{ left: rect.left, top: rect.bottom + 4, width: rect.width }}
          >
            <ul className="max-h-72 overflow-auto text-sm">
              {suggests.map((p: any) => (
                <li key={p._id || p.id || p.slug}>
                  <Link
                    href={{ pathname: "/products/[slug]", params: { slug: p.slug } } as any}
                    className="block px-3 py-2 hover:bg-gray-50"
                    onClick={() => setShowSuggests(false)}
                  >
                    {locale?.toLowerCase().startsWith("ru") ? p?.name?.ru || p?.name?.uz || p.slug : p?.name?.uz || p?.name?.ru || p.slug}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Portal>
      )}
    </div>
  );
}
