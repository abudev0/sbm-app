"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;        // unique (slug yoki _id)
  name?: string;
  nameRu?: string;
  price?: number;
  currency?: string;
  imageUrl?: string; // stored image URL
  image?: string;    // optional compatibility
  rating?: number;
  discountPercent?: number;
  pQuantity?: number;
  sold?: number;
  oldPrice?: number;
  attributes?: string[];
};

type WishlistStore = {
  items: WishlistItem[];
  add: (item: WishlistItem) => void;
  remove: (id: string) => void;
  toggle: (item: WishlistItem) => void;
  clear: () => void;

  _hasHydrated: boolean;
};

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      add: (item) =>
        set((state) => {
          if (!item?.id) return state;
          if (state.items.some((i) => i.id === item.id)) return state;
          return { items: [...state.items, item] };
        }),

      remove: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) get().remove(item.id);
        else get().add(item);
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "sbm-wishlist-v1",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => () => {
        useWishlistStore.setState({ _hasHydrated: true });
      },
    }
  )
);

// Selectors
export const selectWishlistCount = (s: WishlistStore) => s.items.length;
export const selectIsFavorite =
  (id: string) =>
  (s: WishlistStore) =>
    s.items.some((i) => i.id === id);