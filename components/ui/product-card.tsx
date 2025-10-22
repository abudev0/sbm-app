// components/ui/product-card.tsx
"use client";

import { useMemo } from "react";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { useFavorite } from "@/hooks/use-favorite";
import { useCartItem } from "@/hooks/use-cart";

export interface ProductCardProps {
  slug: string;
  name: string;
  nameRu?: string;
  price?: number | string;
  oldPrice?: number;
  priceRaw?: number;
  discountPercent?: number;
  discountRaw?: number;
  image?: string;
  rating?: number;
  sold?: number;
  pQuantity?: number;
  className?: string;
  compact?: boolean;
  attributes?: string[];
}

function toNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function cleanAttributes(attrs?: string[]): string[] {
  const list = Array.isArray(attrs) ? attrs : [];
  return Array.from(
    new Set(
      list
        .map((s) => (typeof s === "string" ? s.trim() : ""))
        .filter(Boolean)
    )
  ).slice(0, 8);
}

function normalizeAttributes(attrs?: string[]): string[] {
  return cleanAttributes(attrs).slice(0, 3);
}

// ---- price formatter: "18 000 So'm"
function formatMoney(
  v: number | string,
  currencyLabel: string
): string {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  // ru-RU beradi minglikni NBSP bilan — oddiy bo'shliqqa almashtiramiz
  const grouped = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
    useGrouping: true,
  })
    .format(n)
    .replace(/\u00A0/g, " ");
  return `${grouped} ${currencyLabel}`;
}

export function ProductCard(props: ProductCardProps) {
  const {
    slug,
    name,
    nameRu = "",
    price,
    oldPrice,
    priceRaw,
    discountPercent,
    discountRaw,
    image = "",
    rating = 0,
    sold,
    pQuantity,
    className,
    compact = false,
    attributes = [],
  } = props;

  const t = useTranslations("ProductCard");
  const locale = useLocale();
  const isRu = locale?.toLowerCase().startsWith("ru");
  const label = isRu ? nameRu || name : name || nameRu;

  const currencyLabel = t("currency") || "So'm"; // i18n fallback

  const favPrice = toNum(price) ?? toNum(priceRaw) ?? 0;
  const favOld = toNum(oldPrice);
  const favRating = toNum(rating) ?? 0;

  const { isFavorite, toggle: toggleFavorite } = useFavorite(slug, {
    name,
    nameRu,
    image,
    price: favPrice,
    oldPrice: favOld,
    discountPercent: toNum(discountPercent),
    rating: favRating,
    pQuantity: toNum(pQuantity),
    sold: toNum(sold),
    attributes: cleanAttributes(attributes),
  });

  const {
    priceToShow,
    oldPriceToShow,
    finalPriceForCart,
    badgeLabel,
    hasDiscount,
  } = useMemo(() => {
    const d =
      typeof discountPercent === "number"
        ? discountPercent
        : typeof discountRaw === "number"
        ? discountRaw
        : 0;

    const effectiveD = d > 0 && d < 100 ? d : 0;
    const baseRaw = toNum(priceRaw);
    const badge = effectiveD ? `-${effectiveD}%` : null;

    if (typeof price === "string") {
      const computedOld =
        effectiveD && baseRaw ? baseRaw : (toNum(oldPrice) ?? undefined);

      return {
        priceToShow: price,
        oldPriceToShow: computedOld,
        finalPriceForCart: baseRaw ?? 0,
        badgeLabel: badge,
        hasDiscount: !!effectiveD || typeof computedOld === "number",
      };
    }

    const base = baseRaw ?? toNum(price) ?? 0;
    if (base <= 0) {
      return {
        priceToShow: "",
        oldPriceToShow: undefined as number | undefined,
        finalPriceForCart: 0,
        badgeLabel: null as string | null,
        hasDiscount: false,
      };
    }

    const hasD = !!effectiveD;
    const final = hasD ? Math.round(base * (1 - effectiveD / 100)) : base;
    const oldShown = hasD ? base : toNum(oldPrice) ?? undefined;

    return {
      priceToShow: final,
      oldPriceToShow: oldShown,
      finalPriceForCart: final,
      badgeLabel: badge,
      hasDiscount: hasD || typeof oldShown === "number",
    };
  }, [price, oldPrice, priceRaw, discountPercent, discountRaw]);

  const cartPayload = useMemo(
    () => ({
      name: label!,
      image: image!,
      rating: favRating,
      price: finalPriceForCart,
      translations: [
        { locale: "uz" as const, name: label, unitLabel: "1 Donasi uchun" },
        { locale: "ru" as const, name: label, unitLabel: "За 1 шт." },
      ],
    }),
    [label, image, favRating, finalPriceForCart]
  );

  const { qty, inc, dec, addOne } = useCartItem(slug, cartPayload);

  const pad = compact ? "p-3" : "p-4";
  const titleSizeMobile = compact ? "text-[10px] leading-[14px]" : "text-[11px] leading-[15px]";
  const titleSizeDesktop = compact ? "sm:text-[13px] sm:leading-[18px]" : "sm:text-[15px] sm:leading-[20px]";
  const imgRatio = compact ? "aspect-[1/0.9]" : "aspect-[1/0.82]";
  const iconBtn = compact ? "w-8 h-8" : "w-9 h-9";
  const heartSize = compact ? "w-[16px] h-[16px]" : "w-[18px] h-[18px]";
  const priceText = compact ? "text-[14px]" : "text-[15px]";
  const pricePad = compact ? "px-2.5 py-1.5" : "px-3 py-1.5";
  const ratingSize = compact ? "w-3 h-3" : "w-3.5 h-3.5";

  const chips = useMemo(() => normalizeAttributes(attributes), [attributes]);

  const apiBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
  const imgSrc = image
    ? image.startsWith("http")
      ? image
      : `${apiBase}/${image.replace(/^\/+/, "")}`
    : "/placeholder.svg";

  // helper to render price w/ currency if numeric
  const renderPrice = (v: number | string) =>
    typeof v === "number" ? formatMoney(v, currencyLabel) : v;

  return (
    <div
      className={[
        "bg-white rounded-[10px] sm:rounded-[16px] overflow-hidden border border-gray-100",
        "h-full",
        className || "",
      ].join(" ")}
    >
      {/* IMAGE */}
      <div
        className={`relative ${imgRatio} ${
          hasDiscount ? "bg-[#FFEDED]" : "bg-[#EEF1FF]/80"
        } flex items-center justify-center overflow-hidden`}
      >
        <div className="absolute left-2.5 bottom-0 inline-flex items-center gap-1 rounded-t-[10px] bg-white px-2 py-[5px]">
          <Star className={`${ratingSize} fill-yellow-400 text-yellow-400`} />
          <span className="text-[11px] font-semibold text-gray-800 leading-none">
            {Number(rating || 0).toFixed(1)}
          </span>
        </div>

        {badgeLabel && (
          <div className="absolute left-2.5 top-2.5 inline-flex items-center rounded-[10px] bg-[#A3BF4C] text-white text-[10px] font-bold px-2 py-[5px] shadow-sm">
            {badgeLabel}
          </div>
        )}

        <button
          onClick={toggleFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          className={`absolute right-2.5 top-2.5 inline-flex items-center justify-center rounded-full border border-gray-200 bg-white  transition-colors ${iconBtn}`}
        >
          <Heart
            className={`${heartSize} ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}`}
          />
        </button>

        <Link
          href={{ pathname: `/products/[slug]`, params: { slug } }}
          className="block w-full h-full"
          aria-label={label}
        >
          <img
            src={imgSrc}
            alt={label}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </Link>
      </div>

      {/* INFO */}
      <div className={pad}>
        <div className="flex items-start justify-between gap-2.5 mb-1.5">
          <Link
            href={{ pathname: `/products/[slug]`, params: { slug } }}
            className="block focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-lg"
          >
            <h3 className={`font-semibold text-gray-900 ${titleSizeMobile} ${titleSizeDesktop} line-clamp-2`}>
              {label}
            </h3>
          </Link>
        </div>

        {/* Attributes */}
        <div className="mb-2 min-h-[18px]">
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {chips.map((chip, i) => (
                <span
                  key={`${chip}-${i}`}
                  className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[10px] sm:text-[11px] tracking-wide text-gray-600 uppercase"
                  title={chip}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Prices */}
        <div className="mb-3 flex sm:flex-row flex-col items-start sm:items-center gap-2">
          {typeof oldPriceToShow === "number" && oldPriceToShow > 0 && (
            <span className="text-[12px] text-gray-400 line-through leading-none">
              {formatMoney(oldPriceToShow, currencyLabel)}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-md bg-gray-100 ${pricePad} ${priceText} font-extrabold leading-none !text-[12px] sm:!text-[18px] ${
              hasDiscount ? "text-red-500" : "text-gray-900"
            }`}
          >
            {priceToShow !== "" ? renderPrice(priceToShow as number | string) : ""}
          </span>
        </div>

        {/* Sold */}
        {typeof sold === "number" && typeof pQuantity === "number" ? (
          <p className="text-[10px] max-h-6 text-[#ED8939] mb-2">
            {t("sold")} : {sold}/{pQuantity}
          </p>
        ) : (
          <div className="h-5" />
        )}

        {/* Counter + Add */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => (qty > 0 ? dec() : undefined)}
              aria-label={t("decreaseQuantity")}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] border border-gray-300 flex items-center justify-center text-gray-700 text-[11px] sm:text-[12px] leading-none ${qty === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={qty === 0}
            >
              −
            </button>
            <span className="font-medium text-gray-900 min-w-[16px] text-center text-[11px] sm:text-[12px]">
              {qty}
            </span>
            <button
              onClick={() => inc()}
              aria-label={t("increaseQuantity")}
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] border border-gray-300 flex items-center justify-center text-gray-700 text-[11px] sm:text-[12px] leading-none"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={() => addOne()}
            aria-label={t("addToCart")}
            title={t("addToCart")}
            className="inline-flex items-center gap-0 sm:gap-1.5 text-[12px] font-medium text-gray-600 hover:text-gray-800"
          >
            <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("addToCart")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
