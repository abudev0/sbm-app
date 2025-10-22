import { BrandListItem, BrandSliderItem, fetchBrandSlider, fetchBrandsList } from "@/lib/api/brand";
import { BrandsSection } from "@/components/brands-page-section";

export const dynamic = "force-dynamic";

export default async function BrandsPage({ params }: { params: { locale: string } }) {
  const locale = params?.locale?.toLowerCase() || "uz";
  const lang = locale.startsWith("ru") ? "ru" : "uz";

  let brands: BrandListItem[] = [];
  try {
    brands = await fetchBrandsList({ lang });
  } catch (e) {
    brands = [];
    // console.error("Brand slider fetch failed:", e);
  }

  return (
    <div className=" ">
      <BrandsSection brands={brands} />
    </div>
  );
}