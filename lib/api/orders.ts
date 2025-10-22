import { clientAxios } from "./axios";
import { setCookieJSON, getCookieJSON, COOKIE_KEYS } from "@/lib/cookies";

export type PaymentMethod = "cash" | "card" | "payme" | "click" | "uzcard";

export type CreateOrderItem = {
  product_id_or_slug: string; // ObjectId yoki slug
  quantity: number;
};

export type CreateOrderPayload = {
  phone: string;
  address?: string;
  lang_long?: string;
  payment_method: PaymentMethod;
  items: CreateOrderItem[];
};

export async function createOrder(payload: CreateOrderPayload) {
  const res = await clientAxios.post("/api/orders", payload);
  
  const data = res.data;
  try {
    setCookieJSON(COOKIE_KEYS.LAST_ORDER, data, {
      maxAge: 60 * 60 * 24, // 1 day
    });
  } catch {}
  return data as any; // { _id, order_id, ... }
}

// orderId = order.order_id (ATL... format), backend route: /orders/order-id/:orderId
export async function getOrderByOrderId(orderId: string) {
  try {
    const res = await clientAxios.get(`/orders/order-id/${encodeURIComponent(orderId)}`);
    return res.data;
  } catch {
    // Fallback: _id orqali
    try {
      const res = await clientAxios.get(`/orders/${encodeURIComponent(orderId)}`);
      return res.data;
    } catch {
      // cookie'dan oxirgi buyurtmani olish
      try {
        const snap = getCookieJSON(COOKIE_KEYS.LAST_ORDER);
        if (snap) return snap;
      } catch {}
      throw new Error("Order not found");
    }
  }
}
