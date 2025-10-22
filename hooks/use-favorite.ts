// hooks/use-favorite.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  addFavorite,
  hasFavorite,
  removeFavorite,
  subscribeFavorites,
  type FavoriteItem,
  toggleFavorite as toggleFavUtil,
  getAllFavorites,
  saveAllFavorites,
} from "@/lib/favorites";

export function useFavorite(id: string, data?: Omit<FavoriteItem, "id">) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    setIsFavorite(id ? hasFavorite(id) : false);
    const unsub = subscribeFavorites(() => {
      setIsFavorite(id ? hasFavorite(id) : false);
    });
    return unsub;
  }, [id]);

  const add = useCallback(() => {
    if (!id) return;
    addFavorite({ id, ...(data || {}) });
    setIsFavorite(true);
  }, [id, data]);

  const remove = useCallback(() => {
    if (!id) return;
    removeFavorite(id);
    setIsFavorite(false);
  }, [id]);

  const toggle = useCallback(() => {
    if (!id) return;
    const next = toggleFavUtil({ id, ...(data || {}) });
    setIsFavorite(next);
  }, [id, data]);

  return { isFavorite, add, remove, toggle };
}

export function useFavoritesList() {
  const [items, setItems] = useState<FavoriteItem[]>([]);

  const reload = useCallback(() => {
    setItems(getAllFavorites());
  }, []);

  useEffect(() => {
    reload();
    const unsub = subscribeFavorites(reload);
    return unsub;
  }, [reload]);

  const removeOne = useCallback((id: string) => {
    removeFavorite(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    saveAllFavorites([]);
    setItems([]);
  }, []);

  return { items, removeOne, clearAll, reload };
}
