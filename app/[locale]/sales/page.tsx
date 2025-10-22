import SpecialOffersSection from "@/components/special-offers-page";
import { fetchOffers } from "@/lib/api/offers";
import { fetchProductsByIds } from "@/lib/api/products"; // Yangi util (pastda kod)

export default async function OffersPage() {
  const offers = await fetchOffers({ page: 1, limit: 12, active: true });

  // Barcha offer.items'dan idlarni yig'ish
  const allProductIds: string[] = Array.from(
    new Set(offers.flatMap((offer: any) => offer.items || []))
  );
  // Barcha mahsulotlarni bir marta olib kelish
  const products = allProductIds.length
    ? await fetchProductsByIds(allProductIds)
    : [];

  // offer'lar uchun productlar mapping
  const offersWithProducts = offers.map((offer: any) => ({
    ...offer,
    products: (offer.items || [])
      .map((id: string) => products.find((p: any) => p.id === id))
      .filter(Boolean)
  }));

  return (
    <div className="min-h-screen">
      <SpecialOffersSection offers={offersWithProducts} />
    </div>
  );
}