import Image from "next/image";
import { getTranslations } from "next-intl/server";
import ProductDetailsTabs from "@/components/product-details-tabs";
import ProductActionsRow from "@/components/product-actions-row";
import { BrandSliderItem } from "@/lib/api/brand";

type RawImageObject = { _id?: string; img?: string; product_id?: string; [k: string]: any };

type ProductBackendFlexible = {
  id: string;
  slug: string;
  brand_id: BrandSliderItem | string;
  brandSlug?: string;
  category?: string;
  nameUz?: string;
  nameRu?: string;
  price?: number;
  oldPrice?: number;
  discountPercent?: number;
  images?: RawImageObject[];
  image?: string | Array<string | RawImageObject>;
  primaryImage?: string;
  rating?: number;
  liked?: boolean;
  createdAt?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  description?: string;
  attributes?: string[];
  [k: string]: any;
};

interface ProductDetailsProps {
  product: ProductBackendFlexible;
  locale: string;
}

function toFullUrl(rel: string): string {
  if (!rel) return "";
  if (rel.startsWith("http://") || rel.startsWith("https://")) return rel;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return rel;
  return base.replace(/\/+$/, "") + "/" + rel.replace(/^\/+/, "");
}

export default async function ProductDetails({ product, locale }: ProductDetailsProps) {
  const t = await getTranslations({ locale, namespace: "ProductPage" });

  const isRu = locale.toLowerCase().startsWith("ru");
  const displayName = isRu ? product.nameRu || product.nameUz || "" : product.nameUz || product.nameRu || "";

  const brandObj = product.brand_id && typeof product.brand_id === "object" ? (product.brand_id as any) : null;
  const brandSlug = brandObj?.slug || product.brandSlug || "";
  const brandName =
    (isRu ? brandObj?.name?.ru || brandObj?.name?.uz : brandObj?.name?.uz || brandObj?.name?.ru) ||
    (isRu ? product.nameRu : product.nameUz) ||
    "";

  const BRAND_LOGOS: Record<string, string> = {
    "selo-zelenoe": "/logos/selo-zelenoe.png",
    "dobraya-burenka": "/logos/dobraya-burenka.png",
  };
  const logoSrc = brandObj?.img ? toFullUrl(brandObj.img) : (brandSlug && BRAND_LOGOS[brandSlug]) || "/placeholder.png";

  const description =
    (isRu ? product.descriptionRu || product.description : product.descriptionUz || product.description) || "";

  // Try to infer a "950 GR" line from attributes if present
  const weightAttr =
    product.attributes?.find((a) => /(\d+)\s?g?r/i.test(a)) ||
    product.attributes?.find((a) => /gram/i.test(a)) ||
    "";

  return (
    <div className="rounded-2xl bg-amber-50 p-4 shadow-sm">
      {/* Title + meta */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{displayName}</h2>
        <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
          {weightAttr ? <span>{weightAttr}</span> : <span>950 GR</span>}
          <span>•</span>
          <span className="text-amber-500">★ {(product.rating ?? 4.0).toFixed(1)}</span>
        </div>
      </div>

      {/* Actions row (price + qty + CTA + heart) */}
      <ProductActionsRow
        price={Number(product.price || 0)}
        cartItem={{
          id: product.id,
          name: displayName,
          price: Number(product.price || 0),
          image: product.images?.[0]?.img || "" ,
        }}
      />

      {/* Brand + Country row */}
      <div className="mt-4 rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-gray-500">{t("brand")}</div>
            <div className="text-sm font-semibold text-gray-800 truncate">{brandName || "—"}</div>
          </div>
          <div className="relative w-16 h-16 rounded-lg bg-white p-2 shadow">
            <Image src={logoSrc} alt={`${brandName || "Brand"} logo`} fill className="object-contain" sizes="64px" />
          </div>
        </div>

        <div className="mt-3 border-t pt-3 text-sm text-gray-800">
          <span className="text-gray-600 mr-1">{t("country") ?? "Mamlakat"}:</span>
          <span>{(brandObj as any)?.country || "Rossiya"}</span>
        </div>
      </div>

      {/* Tabs */}
      <ProductDetailsTabs composition={product.attributes || []} description={description} />

      {/* Rate prompt */}
      <div className="mt-5 text-center text-sm text-gray-500">{t("ratePrompt")}</div>
    </div>
  );
}