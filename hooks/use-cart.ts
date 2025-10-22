"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAllCart,
  subscribeCart,
  upsertCartItem,
  removeCartItem,
  setQty,
  incQty,
  decQty,
  toggleSelectOne,
  setSelectAll,
  clearCart as clearCartUtil,
  type CartItem,
} from "@/lib/cart";

export function useCartItem(id: string, payload?: Partial<CartItem>) {
  const [item, setItem] = useState<CartItem | undefined>(undefined);

  const reload = useCallback(() => {
    const all = getAllCart();
    setItem(all.find((x) => x.id === id));
  }, [id]);

  useEffect(() => {
    reload();
    const unsub = subscribeCart(reload);
    return unsub;
  }, [reload]);

  const inCart = !!item;
  const qty = item?.qty ?? 0;
  const selected = !!item?.selected;

  const addOne = useCallback(() => {
    incQty(id, payload);
  }, [id, payload]);

  const addMany = useCallback((q: number) => {
    if (q <= 0) return;
    const all = getAllCart();
    const existing = all.find((x) => x.id === id);
    if (!existing) {
      upsertCartItem({
        id,
        qty: q,
        selected: true,
        ...(payload || {}),
      });
    } else {
      setQty(id, existing.qty + q);
    }
  }, [id, payload]);

  const setQtySafe = useCallback((q: number) => {
    setQty(id, q);
  }, [id]);

  const inc = useCallback(() => {
    incQty(id, payload);
  }, [id, payload]);

  const dec = useCallback(() => {
    decQty(id);
  }, [id]);

  const remove = useCallback(() => {
    removeCartItem(id);
  }, [id]);

  const toggleSelected = useCallback((sel: boolean) => {
    toggleSelectOne(id, sel);
  }, [id]);

  return { item, inCart, qty, selected, addOne, addMany, setQty: setQtySafe, inc, dec, remove, toggleSelected };
}

export function useCartList() {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const reload = useCallback(() => {
    setItems(getAllCart());
  }, []);

  useEffect(() => {
    reload();
    const unsub = subscribeCart(reload);
    return unsub;
  }, [reload]);

  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const anySelected = items.some((i) => i.selected);
  const selectedItems = useMemo(() => items.filter((i) => i.selected), [items]);
  const totalQty = selectedItems.reduce((s, i) => s + i.qty, 0);
  const totalSum = selectedItems.reduce((s, i) => s + i.qty * i.price, 0);

  const toggleAll = useCallback((sel: boolean) => setSelectAll(sel), []);
  const toggleOne = useCallback((id: string, sel: boolean) => toggleSelectOne(id, sel), []);
  const changeQty = useCallback((id: string, delta: number) => {
    if (delta > 0) incQty(id);
    else if (delta < 0) decQty(id);
  }, []);
  const removeOne = useCallback((id: string) => removeCartItem(id), []);
  const clearAll = useCallback(() => clearCartUtil(), []);

  return { items, reload, allSelected, anySelected, selectedItems, totalQty, totalSum, toggleAll, toggleOne, changeQty, removeOne, clearAll };
}