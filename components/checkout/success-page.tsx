"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getOrderByOrderId } from "@/lib/api/orders";
import { getCookieJSON, COOKIE_KEYS } from "@/lib/cookies";

function formatSum(n: number) {
  return new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 0 }).format(n) ;
}

export default function SuccessPage() {
  const params = useParams();
  const orderId = (params?.orderId as string) || "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = orderId ? await getOrderByOrderId(orderId) : getCookieJSON(COOKIE_KEYS.LAST_ORDER);
        if (mounted) setOrder(data);
      } catch {
        try {
          const snap = getCookieJSON(COOKIE_KEYS.LAST_ORDER);
          if (snap && mounted) setOrder(snap);
        } catch {}
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-amber-100 p-10 text-center">Yuklanmoqda...</div>
      </main>
    );
  }

  const items: Array<any> = order?.items || [];
  const total = Number(order?.total_price || 0);

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-300/70 to-amber-300/30 p-6 sm:p-10 text-center">
        <div className="text-4xl">✔️</div>
        <div className="mt-2 text-[16px] sm:text-[18px] font-semibold text-neutral-900">
          Buyurtma muvaffaqiyatli amalga oshirildi
        </div>
        {order?.order_id ? (
          <div className="text-[14px] sm:text-[15px] text-neutral-700 mt-1">
            ID: <span className="font-semibold">{order.order_id}</span>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-amber-400/60 bg-white/60 p-4 text-left">
            <div className="text-[15px] font-semibold text-neutral-900">Buyurtma tafsilotlari:</div>
            <div className="text-[13px] text-neutral-800 mt-2">
              Mahsulotlar: {items.length} Ta
            </div>
            <ul className="mt-2 space-y-1 text-[13px] text-neutral-800">
              {items.map((it: any) => {
                const name = it?.product_data?.title?.uz || it?.product_data?.title?.ru || "Mahsulot";
                const qty = it?.quantity || 0;
                const line = Number(it?.price || 0) * qty;
                return (
                  <li key={String(it._id)} className="list-disc list-inside">
                    {name} × {qty} = {formatSum(line)}
                  </li>
                );
              })}
              <li className="list-disc list-inside">Jami: {formatSum(total)}</li>
              <li className="list-disc list-inside">To‘lov turi: {(order?.payment_method || "").toString().toUpperCase()}</li>
            </ul>
          </div>

          <div className="rounded-xl border border-amber-400/60 bg-white/60 p-4 text-left">
            <div className="text-[15px] font-semibold text-neutral-900">Yetkazilish manzili:</div>
            <ul className="mt-2 space-y-1 text-[13px] text-neutral-800 list-disc list-inside">
              {order?.address ? <li>{order.address}</li> : null}
              {order?.lang_long ? <li>{order.lang_long}</li> : null}
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <a href="/profile/orders" className="inline-flex rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm hover:bg-neutral-800">
            Buyurtma holatini profil sahifasi orqali habar olishingiz mumkin
          </a>
        </div>
      </div>
    </main>
  );
}