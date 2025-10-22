"use client";
import { getCookie, setCookie, COOKIE_KEYS } from "@/lib/cookies";

import { use, useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import SearchBar from "@/components/search/search-bar";
import BridgeProvider from "@/components/bridge-provider";
import { usePathname, useRouter } from "next/navigation";

type NavItem = {
  href:
    | "/"
    | "/products"
    | "/brands"
    | "/contact"
    | "/about"
    | "/delivery-payment"
    | "/sales"
    | "/news";
  key: string;
};

const navItems: NavItem[] = [
  { href: "/", key: "home" },
  { href: "/products", key: "products" },
  { href: "/brands", key: "brands" },
  { href: "/contact", key: "contact" },
  { href: "/about", key: "about" },
  { href: "/delivery-payment", key: "deliveryPayment" },
  { href: "/sales", key: "sales" },
  { href: "/news", key: "news" },
];

function FlagButton({
  code,
  active,
  onClick,
  className = "",
}: {
  code: "uz" | "ru";
  active?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const src = code === "uz" ? "/rus-flag.svg" : "/uzb-flag.svg";
  return (
    <button
      onClick={onClick}
      className={`relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-white transition border ${active ? "border-amber-500" : "border-transparent"
        } ${className}`}
      aria-label={code.toUpperCase()}
    >
      <img src={src} alt={code.toUpperCase()} className="h-7 w-7 rounded-full object-cover" />
    </button>
  );
}

export function Header() {
  const [isRouting, setIsRouting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Loading bar ko‘rsatishni biroz kechiktiramiz (tez routeda flash bo‘lmasin)
  const [showRouteLoader, setShowRouteLoader] = useState(false);
  const loaderTimer = useRef<number | null>(null);

  const t = useTranslations("header");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // route o‘zgarsa, loaderni o‘chir
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      setIsRouting(false);
      setShowRouteLoader(false);
      if (loaderTimer.current) {
        window.clearTimeout(loaderTimer.current);
        loaderTimer.current = null;
      }
    }
  }, [pathname]);

  // isRouting true bo‘lsa 120ms dan keyin progress-bar ko‘rsat
  useEffect(() => {
    if (isRouting) {
      if (loaderTimer.current) window.clearTimeout(loaderTimer.current);
      loaderTimer.current = window.setTimeout(() => {
        setShowRouteLoader(true);
      }, 120) as unknown as number;
    } else {
      setShowRouteLoader(false);
      if (loaderTimer.current) {
        window.clearTimeout(loaderTimer.current);
        loaderTimer.current = null;
      }
    }
    return () => {
      if (loaderTimer.current) {
        window.clearTimeout(loaderTimer.current);
        loaderTimer.current = null;
      }
    };
  }, [isRouting]);

  const pushWithLoading = (href: string) => {
    if (href === pathname) return;
    setIsRouting(true);
    router.push(href as any);
  };

  // locale ni localStorage’dan tiklash
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLanguage = getCookie(COOKIE_KEYS.LANGUAGE);
    if (storedLanguage && storedLanguage !== locale) {
      pushWithLoading(`/${storedLanguage}${pathname.replace(/^\/(uz|ru)/, "")}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setLanguage(lang: "uz" | "ru") {
    if (!isMobile) {
      if (lang == "uz") {
        lang = "ru"
      } else {
        lang = "uz"
      }
    }
    if (lang === locale) return;
    if (typeof window !== "undefined") setCookie(COOKIE_KEYS.LANGUAGE, lang, { maxAge: 60 * 60 * 24 * 365 });
    pushWithLoading(`/${lang}${pathname.replace(/^\/(uz|ru)/, "")}`);
  }

  const isActive = (href: string) => {
    const clean = pathname.replace(/^\/(uz|ru)/, "") || "/";
    return clean === href;
  };

  // umumiy link handler (desktop & mobile)
  const onNavClick = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isActive(href)) setIsRouting(true);
    router.push(href as any);
  };

  return (
    <header
      className="relative bg-[#FFF7E4]"
      aria-busy={isRouting}
    >
      {/* global loader ui */}
      {showRouteLoader && (
        <>
          <div className="fixed inset-x-0 top-0 z-[70]">
            <div className="h-1 w-full bg-amber-500/20 overflow-hidden">
              <div className="h-full w-2/5 bg-amber-500 routebar" />
            </div>
          </div>
          <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[70] rounded-full bg-white/90 px-3 py-1 text-[12px] font-medium text-gray-700 shadow">
            Loading…
          </div>

          <style jsx global>{`
            @keyframes routebar-sweep {
              0% {
                transform: translateX(-40%);
              }
              100% {
                transform: translateX(160%);
              }
            }
            .routebar {
              animation: routebar-sweep 1.2s ease-in-out infinite;
              will-change: transform;
            }
          `}</style>
        </>
      )}

      {/* Bridge mount */}
      <BridgeProvider />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* TOP BAR */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="relative block h-12 w-24"
            aria-label="SBM Central Group"
            onClick={(e: any) => {
              if (!isActive("/")) setIsRouting(true);
            }}
          >
            <Image src="/sbm-logo.png" alt="SBM Central Group" fill />
          </Link>

          {/* Desktop: Search */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-6">
            <SearchBar />
          </div>

          {/* Right (Desktop) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-[12px] text-gray-500">{t("help")}</div>
              <a href="tel:+998940130744" className="text-[15px] font-semibold text-neutral-900">
                +998 94 013 07 44
              </a>
            </div>

            {/* Desktop: only language switch and search/profile removed per request */}
            <div className="flex items-center gap-2">
              <FlagButton code="uz" active={locale === "uz"} onClick={() => setLanguage("uz")} />
              <FlagButton code="ru" active={locale === "ru"} onClick={() => setLanguage("ru")} />
            </div>
          </div>

          {/* Right (Mobile) - no burger, no profile/wishlist/cart */}
          <div className="md:hidden flex items-center gap-2">
            <div className="text-right leading-tight">
              <div className="text-[12px] text-gray-500">{t("help")}</div>
              <a href="tel:+998940130744" className="text-[14px] font-semibold text-neutral-900">
                +998 94 013 07 44
              </a>
            </div>

            {/* Quick language toggle */}
            <FlagButton
              code={(locale as "uz" | "ru") || "uz"}
              active
              onClick={() => setLanguage(locale === "uz" ? "ru" : "uz")}
            />
          </div>
        </div>

        {/* NAV BAR (Desktop) */}
        <div className="hidden md:block border-t border-gray-200">
          <nav className="flex flex-wrap items-center gap-6 py-3 text-[15px]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavClick(item.href)}
                className={`transition ${isActive(item.href) ? "text-amber-500" : "text-neutral-700"
                  }`}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;