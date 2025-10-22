import { notFound } from "next/navigation";
import { fetchOfferBySlug } from "@/lib/api/offers";
import { ProductCard } from "@/components/ui/product-card";
import { OfferCard } from "@/components/offer-card";

type PageParams = { params: { locale: string; slug: string } };

export default async function SalesDetailPage({ params }: PageParams) {
  // 1. Backenddan offer (sales) ni slug bo'yicha olib kelamiz
  const offer = await fetchOfferBySlug(params.slug);
  if (!offer) return notFound();

  const locale = params.locale;

  return (
    <div className="min-h-screen  ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
        {Array.isArray(offer.items) && offer.items.length > 0 ? (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-800 text-center">
              {offer.items.length} mahsulot
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {offer.items.map((p: any) => (
                <ProductCard
                  key={p._id || p.id || p.slug}
                  name={p.name?.[locale] || p.name?.uz || p.name?.ru || p.slug}
                  nameRu={p.name?.ru || p.name?.uz || p.slug}
                  price={p.price!}
                  oldPrice={p.oldPrice != null ? p.oldPrice : undefined}
                  discountPercent={p.discount}
                  image={Array.isArray(p.images) && p.images[0]?.img ? p.images[0].img : p.image || ""}
                  rating={p.rating ?? 0}
                  slug={p.slug}
                  sold={p.sold}
                  pQuantity={p.pQuantity}
                  attributes={p.attributes?.slice(0, 3)}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">Bu aksiyada mahsulotlar hozircha yo‘q.</p>
        )}
      </div>
    </div>
  );
}