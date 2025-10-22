"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;        // unique (slug yoki _id)
  name: string;
  price: number;     // unit price (number)
  imageUrl?: string;
  quantity: number;  // >= 1
};

type CartStore = {
  items: CartItem[];
  // actions
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  increment: (id: string, by?: number) => void;
  decrement: (id: string, by?: number) => void;
  setQuantity: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;

  // hydration state
  _hasHydrated: boolean;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      addItem: (payload) => {
        const { id, name, price, imageUrl, quantity = 1 } = payload;
        if (!id) return;
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx >= 0) {
            const next = [...state.items];
            next[idx] = { ...next[idx], quantity: next[idx].quantity + Math.max(1, quantity) };
            return { items: next };
          }
          return {
            items: [
              ...state.items,
              {
                id,
                name,
                price: Number(price) || 0,
                imageUrl,
                quantity: Math.max(1, quantity),
              },
            ],
          };
        });
      },

      increment: (id, by = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx < 0) return state;
          const next = [...state.items];
          next[idx] = { ...next[idx], quantity: next[idx].quantity + Math.max(1, by) };
          return { items: next };
        }),

      decrement: (id, by = 1) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx < 0) return state;
          const next = [...state.items];
          const newQty = next[idx].quantity - Math.max(1, by);
          if (newQty <= 0) next.splice(idx, 1);
          else next[idx] = { ...next[idx], quantity: newQty };
          return { items: next };
        }),

      setQuantity: (id, qty) =>
        set((state) => {
          const idx = state.items.findIndex((i) => i.id === id);
          if (idx < 0) return state;
          if (qty <= 0) return { items: state.items.filter((i) => i.id !== id) };
          const next = [...state.items];
          next[idx] = { ...next[idx], quantity: qty };
          return { items: next };
        }),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "sbm-cart-v1",
      partialize: (state) => ({ items: state.items }),
      onRehydrateStorage: () => (state, error) => {
        // Rehydration tugadi
        useCartStore.setState({ _hasHydrated: true });
      },
    }
  )
);

// Selectors
export const selectCartTotalQty = (s: CartStore) =>
  s.items.reduce((acc, it) => acc + it.quantity, 0);

export const selectCartTotalPrice = (s: CartStore) =>
  s.items.reduce((acc, it) => acc + it.price * it.quantity, 0);