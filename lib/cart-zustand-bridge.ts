"use client";

import { getAllCart, subscribeCart, type CartItem as LibCartItem } from "@/lib/cart";
import { getAllFavorites, subscribeFavorites, type FavoriteItem as LibFavoriteItem } from "@/lib/favorites";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

// Bir marta o‘rnatish uchun guard
let installed = false;

function mapLibCartToZustand(items: LibCartItem[]) {
  // Zustand cart-store CartItem: { id, name, price, imageUrl?, quantity }
  return items.map((it: any) => {
    const name =
      it?.name ??
      (Array.isArray(it?.translations) && it.translations[0]?.name) ??
      "Product";
    const imageUrl = it?.imageUrl ?? it?.image ?? "";
    const price = Number(it?.price ?? 0);
    const quantity = Number(it?.qty ?? 0);
    return {
      id: String(it.id),
      name,
      price,
      imageUrl,
      quantity,
    };
  });
}

function mapLibFavoritesToZustand(items: LibFavoriteItem[]) {

  return items.map((it: any) => ({
    id: String(it.id),
    name: it?.name,
    nameRu: it?.nameRu,
    price: it?.price,
    currency: it?.currency,
    imageUrl: it?.imageUrl ?? it?.image,
    image: it?.image,
    rating: it?.rating,
    discountPercent: it?.discountPercent,
    pQuantity: it?.pQuantity,
    sold: it?.sold,
    oldPrice: it?.oldPrice,
    attributes: Array.isArray(it?.attributes) ? it.attributes : [],
  }));
}

/**
 * lib/cart va lib/favorites holatini Zustand store’lariga mirror qiladi.
 * Header’dagi badge’lar uchun kerak (useCartStore/useWishlistStore selectorlar).
 * Bu funksiyani clientda bir marta chaqirish kifoya.
 */
export function installCartFavoritesBridge(): () => void {
  if (installed) {
    return () => {};
  }
  installed = true;

  // Dastlabki sync
  const applyCart = () => {
    const libItems = getAllCart();
    useCartStore.setState({
      items: mapLibCartToZustand(libItems),
      _hasHydrated: true,
    });
  };
  const applyFav = () => {
    const favs = getAllFavorites();
    useWishlistStore.setState({
      items: mapLibFavoritesToZustand(favs),
      _hasHydrated: true,
    });
  };

  applyCart();
  applyFav();

  // Subscribelar orqali doimiy sync
  const unsubCart = subscribeCart(applyCart);
  const unsubFav = subscribeFavorites(applyFav);

  // Cleanup
  return () => {
    try {
      unsubCart?.();
    } catch {}
    try {
      unsubFav?.();
    } catch {}
    installed = false;
  };
}