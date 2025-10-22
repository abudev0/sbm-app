"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import {
  getCartItem,
  upsertCartItem,
  setQty,
  saveAllCart,
  getAllCart,
  type CartItem as NewCartItem,
} from "@/lib/cart";

type ProductActionsRowProps = {
  price: number;
  cartItem: {
    id: string;
    name?: string;
    image?: string;
    rating?: number;
    price?: number;
    currency?: string;
    translations?: NewCartItem["translations"];
    attributes?: NewCartItem["attributes"];
  };
};

export default function ProductActionsRow({ price, cartItem }: ProductActionsRowProps) {
  const router = useRouter();
  const [qty, setLocalQty] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  const buildPayload = React.useCallback(() => {
    return {
      id: cartItem.id,
      name: cartItem.name,
      image: cartItem.image,
      rating: cartItem.rating,
      price: Number(price ?? cartItem.price ?? 0),
      currency: cartItem.currency,
      translations: cartItem.translations,
      attributes: cartItem.attributes,
    } as Omit<NewCartItem, "selected" | "qty"> & { qty?: number; selected?: boolean };
  }, [cartItem, price]);

  async function ensureEmit() {
    try {
      const snapshot = getAllCart();
      saveAllCart(snapshot); // save again to trigger emitChange
    } catch (e) {
      // ignore
    }
  }

  async function addOrIncrease(q: number) {
    if (!cartItem?.id) return false;
    try {
      const existing = getCartItem(cartItem.id);
      if (existing) {
        const next = Math.max(1, Math.min(999, existing.qty + q));
        setQty(cartItem.id, next);
      } else {
        upsertCartItem({
          ...buildPayload(),
          qty: Math.max(1, Math.min(999, q)),
          selected: true,
        });
      }

      await ensureEmit();
      // tiny pause to let listeners react
      await new Promise((r) => setTimeout(r, 60));
      return true;
    } catch (err) {
      console.error("[product-actions] addOrIncrease error:", err);
      return false;
    }
  }

  const decrease = () => setLocalQty((v) => Math.max(1, v - 1));
  const increase = () => setLocalQty((v) => Math.min(999, v + 1));

  async function handleGoToCart() {
    if (loading) return;
    setLoading(true);
    try {
      const ok = await addOrIncrease(qty);
      if (ok) {
        await new Promise((r) => setTimeout(r, 40));
        router.push("/cart");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-between gap-4">
        {/* Narx */}
        <div>
          <div className="text-2xl font-extrabold text-gray-900 leading-none">
            {new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0, useGrouping: true })
              .format(price || 0)
              .replace(/\u00A0/g, " ")}{" "}
            {cartItem.currency ?? "So'm"}
          </div>
        </div>


      </div>

      {/* CTA */}
      <div className="mt-4 flex items-center justify-between gap-3">
              {/* Qty controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={decrease}
            aria-label="Kamaytir"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200text-gray-800"
          >
            −
          </button>

          <div className="min-w-[36px] text-center text-lg font-semibold text-gray-900">
            {qty}
          </div>

          <button
            onClick={increase}
            aria-label="Oshirish"
            className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-gray-200 text-gray-800 "
          >
            +
          </button>
        </div>
        <button
          onClick={handleGoToCart}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-lg  bg-amber-100 text-amber-900 font-semibold shadow-md"
          aria-label="Savatga o'tish"
        >
          Savatga o‘tish
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}