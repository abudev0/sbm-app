import { getCookieJSON, setCookieJSON, COOKIE_KEYS } from "./cookies";

const BUS_EVENT = "cart:changed";
const STORAGE_PING = "cart:ping";

export type LocaleCode = "uz" | "ru";

export type Translated = {
  locale: LocaleCode;
  name: string;
  unitLabel?: string;
};

export type CartItem = {
  id: string;
  name?: string;
  image?: string;
  rating?: number;
  price: number; // numeric, per unit
  qty: number;
  selected: boolean;
  currency?: string;
  translations?: Translated[];
  attributes?: string[];
  [k: string]: any;
};

function emitChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUS_EVENT));
    try {
      // Still use localStorage for ping to sync tabs
      localStorage.setItem(STORAGE_PING, String(Date.now()));
    } catch {}
  }
}

export function getAllCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const data = getCookieJSON<CartItem[]>(COOKIE_KEYS.CART);
  return Array.isArray(data) ? data : [];
}

export function saveAllCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  setCookieJSON(COOKIE_KEYS.CART, items, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  emitChange();
}

export function getCartItem(id: string): CartItem | undefined {
  return getAllCart().find((x) => x.id === id);
}

export function upsertCartItem(newItem: Omit<CartItem, "qty" | "selected"> & { qty?: number; selected?: boolean }) {
  if (!newItem?.id) return;
  const list = getAllCart();
  const idx = list.findIndex((x) => x.id === newItem.id);
  if (idx === -1) {
    const item: CartItem = {
      id: newItem.id,
      name: newItem.name,
      image: newItem.image,
      rating: newItem.rating,
      price: Math.max(0, Number(newItem.price || 0)),
      qty: Math.max(1, Number(newItem.qty || 1)),
      selected: typeof newItem.selected === "boolean" ? newItem.selected : true,
      currency: newItem.currency,
      translations: newItem.translations,
      attributes: newItem.attributes,
    };
    list.push(item);
  } else {
    const curr = list[idx];
    list[idx] = {
      ...curr,
      ...newItem,
      price: Math.max(0, Number(newItem.price ?? curr.price)),
      qty: Math.max(1, Number(newItem.qty ?? curr.qty)),
      selected: typeof newItem.selected === "boolean" ? newItem.selected : curr.selected,
    } as CartItem;
  }
  saveAllCart(list);
}

export function removeCartItem(id: string) {
  saveAllCart(getAllCart().filter((x) => x.id !== id));
}

export function setQty(id: string, qty: number) {
  const q = Math.max(0, Math.min(999, Math.floor(Number(qty) || 0)));
  if (q === 0) return removeCartItem(id);
  const list = getAllCart().map((x) => (x.id === id ? { ...x, qty: q } : x));
  saveAllCart(list);
}

export function incQty(id: string, payload?: Partial<CartItem>) {
  const list = getAllCart();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) {
    const price = Math.max(0, Number(payload?.price || 0));
    const item: CartItem = {
      id,
      name: payload?.name,
      image: payload?.image,
      rating: payload?.rating,
      price,
      qty: 1,
      selected: true,
      currency: payload?.currency,
      translations: payload?.translations,
      attributes: payload?.attributes,
    };
    list.push(item);
  } else {
    list[idx] = { ...list[idx], qty: Math.min(999, list[idx].qty + 1) };
  }
  saveAllCart(list);
}

export function decQty(id: string) {
  const list = getAllCart();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) return;
  const next = Math.max(0, list[idx].qty - 1);
  if (next === 0) {
    list.splice(idx, 1);
  } else {
    list[idx] = { ...list[idx], qty: next };
  }
  saveAllCart(list);
}

export function toggleSelectOne(id: string, selected: boolean) {
  const list = getAllCart().map((x) => (x.id === id ? { ...x, selected } : x));
  saveAllCart(list);
}

export function setSelectAll(selected: boolean) {
  const list = getAllCart().map((x) => ({ ...x, selected }));
  saveAllCart(list);
}

export function clearCart() {
  saveAllCart([]);
}

export function subscribeCart(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const onLocal = () => cb();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_PING) cb();
  };
  window.addEventListener(BUS_EVENT as any, onLocal);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BUS_EVENT as any, onLocal);
    window.removeEventListener("storage", onStorage);
  };
}