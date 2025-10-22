"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { LocaleCode } from "@/lib/cart";
import { useCartList } from "@/hooks/use-cart";
import dynamic from "next/dynamic";
import { createOrder, type PaymentMethod } from "@/lib/api/orders";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/auth/auth-modal";
import { Wallet, MapPin, CreditCard } from "lucide-react";
import { getDistrictsByRegionId } from "hududlar";
import toast from "react-hot-toast";

// Desktop right column (unchanged)
import { CartSidebar } from "@/components/cart-sidebar";

// Mobile helpers
import AccordionCard from "@/components/checkout/accordion-card";
import MobileCartList from "@/components/checkout/mobile-cart-list";
import MobileSummaryCard from "@/components/checkout/mobile-summary-card";

const MapPicker = dynamic(() => import("@/components/map-picker"), { ssr: false });

function formatSum(n: number, nfLocale: string) {
  return new Intl.NumberFormat(nfLocale, { maximumFractionDigits: 0 }).format(n);
}

export default function CheckoutPage() {
  const t = useTranslations("Checkout");
  const locale = (useLocale() as LocaleCode) || "uz";
  const nfLocale = String(locale).toLowerCase().startsWith("ru") ? "ru-RU" : "uz-UZ";
  const router = useRouter();

  // Cart
  const { selectedItems, totalSum, clearAll } = useCartList();

  // Address/payment state
  const [districts, setDistricts] = useState<Array<{ value: string; label: string }>>([]);
  const [district, setDistrict] = useState<string>("");
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [floor, setFloor] = useState("");
  const [deliveryOpen, setDeliveryOpen] = useState(true);
  const [paymentOpen, setPaymentOpen] = useState(true);

  const [tab, setTab] = useState<"card" | "cash">("card");
  const [method, setMethod] = useState<PaymentMethod>("payme");

  const [mapOpen, setMapOpen] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [orderSuccess, setOrderSuccess] = useState<{
    id?: string;
    address: string;
    details: Array<{ title: string }>;
  } | null>(null);

  const { user, isAuthenticated } = useAuthStore();

  // Delivery price (auto-calculated as in screenshots)
  const deliveryPrice = useMemo(() => (selectedItems.length > 0 ? 35000 : 0), [selectedItems.length]);
  const finalSum = totalSum + deliveryPrice;

  // Districts load once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ds = await getDistrictsByRegionId(11);
        const items = ds
          .map((d: any) => {
            const name = String(locale).toLowerCase().startsWith("ru")
              ? d.name_ru ?? d.name_uz ?? d.name
              : d.name_uz ?? d.name_ru ?? d.name;
            return typeof name === "string" && name.trim() ? { value: name, label: name } : null;
          })
          .filter(Boolean) as Array<{ value: string; label: string }>;
        const unique = Array.from(new Map(items.map((it) => [it.label, it])).values());
        if (mounted) setDistricts(unique);
      } catch (err: any) {
        toast.error(err.message || err.toString());
        console.log(err.message || err.toString());
      }
    })();
    return () => {
      mounted = false;
    };
  }, [locale]);

  // Validation (address OR map coords; district optional)
  const isValid = useMemo(
    () => selectedItems.length > 0 && (address.trim().length >= 6 || !!coords),
    [selectedItems.length, address, coords]
  );

  function onChangeTab(next: "card" | "cash") {
    setTab(next);
    setMethod(next === "cash" ? "cash" : method === "cash" ? "payme" : method);
  }

  async function handlePlaceOrder() {
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    if (!isValid) {
      toast.error(t("placeOrder.invalid"));
      return;
    }
    if (!user?.phone_number) {
      toast.error(t("placeOrder.noPhone", { default: "Telefon raqamingiz kiritilmagan." }));
      return;
    }

    setPlacing(true);
    try {
      const itemsSnapshot = selectedItems.map((i: any) => ({ ...i }));
      const items = itemsSnapshot
        .map((i: any) => ({
          product_id_or_slug: i.id,
          quantity: Number(i.qty || 0),
        }))
        .filter((x: any) => x.quantity > 0);

      const longParts = [
        district && `${district} ${t("districtSuffix", { default: "Tumani" })}`,
        floor && `${floor}-${t("floorSuffix", { default: "qavat" })}`,
        coords ? `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : "",
      ].filter(Boolean);

      const payload = {
        phone: user.phone_number,
        address: address?.trim() || undefined,
        lang_long: longParts.join(", "),
        payment_method: method,
        items,
      } as const;

      const created = await createOrder(payload);
      const orderId = created?.order_id || created?._id;

      try {
        await clearAll?.();
      } catch {}

      // Build summary lines for success
      const lines: Array<{ title: string }> = [];
      lines.push({ title: t("summary.productsCount", { default: "Mahsulotlar", count: itemsSnapshot.length }) });
      itemsSnapshot.forEach((i: any) =>
        lines.push({
          title: `${i.title || i.name} × ${i.qty} = ${formatSum(Number(i.price) * Number(i.qty), nfLocale)} ${t("currency")}`,
        })
      );
      lines.push({
        title: `${t("summary.delivery", { default: "Yetkazib berish" })}: ${formatSum(deliveryPrice, nfLocale)} ${t("currency")}`,
      });
      lines.push({
        title: `${t("summary.total", { default: "Jami" })}: ${formatSum(finalSum, nfLocale)} ${t("currency")}`,
      });
      lines.push({
        title: `${t("summary.payMethod", { default: "To‘lov turi" })}: ${
          tab === "cash" ? t("payment.cash") : "Karta"
        }`,
      });

      setOrderSuccess({
        id: orderId,
        address:
          address ||
          [district && `${district} ${t("districtSuffix", { default: "Tumani" })}`, floor && `${floor}-${t("floorSuffix", { default: "qavat" })}`]
            .filter(Boolean)
            .join(", ") ||
          (coords ? `GPS: ${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}` : ""),
        details: lines,
      });
    } catch (e: any) {
      toast.error(e?.message || t("placeOrder.error"));
    } finally {
      setPlacing(false);
    }
  }

  // Success UI (unchanged)
  if (orderSuccess) {
    return (
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-[26px] sm:text-[28px] font-extrabold text-neutral-900">{t("title")}</div>
        <div className="mt-6">
          <div className="mx-auto max-w-4xl rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-300/70 to-amber-300/50 p-6 sm:p-8 shadow">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full border-2 border-neutral-800">
              <span className="text-2xl">✓</span>
            </div>
            <div className="text-center font-medium text-neutral-800">
              {t("success.title", { default: "Buyurtma muvaffaqiyatli amalga oshirildi" })}
            </div>
            {orderSuccess.id && (
              <div className="mt-1 text-center text-neutral-900 font-semibold">ID: {orderSuccess.id}</div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-amber-400/70 bg-white/40 p-4">
                <div className="text-[16px] font-semibold mb-2">
                  {t("success.detailsTitle", { default: "Buyurtma tafsilotlari" })}
                </div>
                <ul className="text-[13px] text-neutral-800 space-y-2">
                  {orderSuccess.details.map((d, i) => (
                    <li key={i}>• {d.title}</li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-amber-400/70 bg-white/40 p-4">
                <div className="text-[16px] font-semibold mb-2">
                  {t("success.addressTitle", { default: "Yetkazilish manzili" })}
                </div>
                <ul className="text-[13px] text-neutral-800 space-y-2">
                  {orderSuccess.address ? <li>• {orderSuccess.address}</li> : null}
                </ul>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => router.push("/profile?tab=orders")}
                className="rounded-xl bg-neutral-800 px-5 py-2.5 text-white text-sm hover:bg-neutral-900 transition"
              >
                {t("success.toProfile", { default: "Buyurtma holatini profil sahifasidan ko‘ring" })}
              </button>
              <button
                onClick={() => router.push("/products")}
                className="rounded-xl border border-neutral-800 px-5 py-2.5 text-sm hover:bg-neutral-50 transition"
              >
                {t("success.continue", { default: "Xaridni davom ettirish" })}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Regular Checkout UI (mobile-first, no buyer-info form)
  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="text-[26px] sm:text-[28px] font-extrabold text-neutral-900">{t("title")}</div>
      <div className="text-[13px] text-neutral-400 mt-1">{t("hint")}</div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT (mobile-first column) */}
        <section className="space-y-4">
          {/* Mobile: cart list card */}
          <div className="lg:hidden">
            <MobileCartList locale={locale} />
          </div>

          {/* Accordion: Delivery address */}
          <AccordionCard
            open={deliveryOpen}
            onToggle={() => setDeliveryOpen((o) => !o)}
            title={t("address.title", { default: "Yetkazib berish manzilini kiriting" })}
            subtitle={t("address.note", { default: "Yetkazib berish faqat Toshkent shahri ichida amalga oshiriladi!" })}
            icon={<MapPin className="w-5 h-5 text-rose-500" />}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* District select */}
              <div>
                <label className="block text-[13px] text-neutral-700 mb-1">{t("fields.district")}</label>
                <select
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option value="">{t("placeholders.select")}</option>
                  {districts.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Floor */}
              <div>
                <label className="block text-[13px] text-neutral-700 mb-1">{t("fields.floor")}</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
                  placeholder={t("placeholders.floor")}
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-[13px] text-neutral-700 mb-1">{t("fields.address")}</label>
                <input
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
                  placeholder={t("placeholders.address")}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {coords && (
                  <div className="mt-1 text-[12px] text-neutral-500">
                    {t("fields.gps")}: {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
                  </div>
                )}
              </div>

              {/* Map button + Sum */}
              <div>
                <button
                  type="button"
                  onClick={() => setMapOpen(true)}
                  className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-[14px] text-neutral-900 hover:bg-neutral-200/60 transition"
                  aria-label={t("fields.mapButtonAria")}
                >
                  {t("fields.mapButton")} <span className="ml-1 align-middle">⌖</span>
                </button>
              </div>
              <div>
                <label className="block text-[13px] text-neutral-700 mb-1">{t("fields.sum")}</label>
                <input
                  disabled
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
                  value={`${formatSum(deliveryPrice, nfLocale)} ${t("currency")}`}
                />
                <div className="mt-1 text-[12px] text-neutral-500">
                  {t("address.autoCalc", { default: "Yetkazib berish summasi manzilga qarab avtomatik hisoblanadi!" })}
                </div>
              </div>
            </div>
          </AccordionCard>

          {/* Accordion: Payment */}
          <AccordionCard
            open={paymentOpen}
            onToggle={() => setPaymentOpen((o) => !o)}
            title={t("payment.title")}
            icon={<CreditCard className="w-5 h-5 text-sky-600" />}
          >
            {/* Tabs: Card / Cash */}
            <div className="flex rounded-2xl bg-neutral-100 p-1" role="tablist" aria-label={t("payment.title")}>
              <button
                role="tab"
                aria-selected={tab === "card"}
                className={[
                  "flex-1 rounded-xl py-2 text-[16px] font-medium transition",
                  tab === "card" ? "bg-white shadow text-neutral-900" : "text-neutral-700 hover:text-neutral-900",
                ].join(" ")}
                onClick={() => onChangeTab("card")}
              >
                {t("payment.card")}
              </button>
              <button
                role="tab"
                aria-selected={tab === "cash"}
                className={[
                  "flex-1 rounded-xl py-2 text-[16px] font-medium transition",
                  tab === "cash" ? "bg-white shadow text-neutral-900" : "text-neutral-700 hover:text-neutral-900",
                ].join(" ")}
                onClick={() => onChangeTab("cash")}
              >
                {t("payment.cash")}
              </button>
            </div>

            {tab === "card" ? (
              <div className="mt-4" role="radiogroup" aria-label={t("payment.cardProviders", { default: "Kartalar" })}>
                <div className="flex flex-wrap gap-3">
                  {/* Payme */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "payme"}
                    onClick={() => setMethod("payme")}
                    className={[
                      "inline-flex items-center gap-3 rounded-2xl px-6 py-3 transition shadow",
                      "border-2",
                      method === "payme"
                        ? "border-amber-500 ring-2 ring-amber-200 bg-neutral-800"
                        : "border-transparent bg-neutral-800 text-white hover:bg-neutral-900",
                    ].join(" ")}
                    title={t("payment.payWith", { provider: "Payme" })}
                  >
                    <span
                      className={[
                        "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                        method === "payme" ? "bg-amber-500 border-amber-500" : "border-white/60",
                      ].join(" ")}
                      aria-hidden
                    />
                    <img src="/payme.png" alt="Payme" className="h-6" />
                  </button>

                  {/* Click */}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "click"}
                    onClick={() => setMethod("click")}
                    className={[
                      "inline-flex items-center gap-3 rounded-2xl px-6 py-3 transition shadow",
                      "border-2",
                      method === "click"
                        ? "border-amber-500 ring-2 ring-amber-200 bg-neutral-800"
                        : "border-transparent bg-neutral-800 text-white hover:bg-neutral-900",
                    ].join(" ")}
                    title={t("payment.payWith", { provider: "Click" })}
                  >
                    <span
                      className={[
                        "inline-flex h-4 w-4 items-center justify-center rounded-full border",
                        method === "click" ? "bg-amber-500 border-amber-500" : "border-white/60",
                      ].join(" ")}
                      aria-hidden
                    />
                    <img src="/click.png" alt="Click" className="h-6" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <div className="rounded-xl border bg-black px-4 py-3 text-[13px] text-white flex items-center gap-2">
                  <Wallet />
                  {t("payment.banner", { default: "Buyurtmani qabul qilganingizdan so‘ng naqd yoki karta orqali to‘lov qilishingiz mumkin!" })}
                </div>
              </div>
            )}
          </AccordionCard>

          {/* Summary card (mobile) */}
          <MobileSummaryCard
            locale={locale}
            deliveryPrice={deliveryPrice}
            grandTotal={finalSum}
            onPlaceOrder={placing ? undefined : handlePlaceOrder}
          />
          {placing && (
            <div className="text-center text-sm text-neutral-500">{t("placeOrder.placing", { default: "Buyurtma yuborilmoqda…" })}</div>
          )}
        </section>

        {/* RIGHT (desktop) */}
        <aside className="hidden lg:block">
          <CartSidebar
            locale={locale}
            title={t("cartSidebarTitle")}
            deliveryPrice={deliveryPrice}
            totalSumOverride={finalSum}
            onPlaceOrder={placing ? undefined : handlePlaceOrder}
          />
          {placing && (
            <div className="mt-2 text-center text-sm text-neutral-500">
              {t("placeOrder.placing", { default: "Buyurtma yuborilmoqda…" })}
            </div>
          )}
        </aside>
      </div>

      {/* Map Modal */}
      <MapPicker
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={({ lat, lng, label, address }) => {
          setCoords({ lat, lng });
          if (address && address.trim().length > 0) setAddress(address);
          else setAddress((prev) => (prev?.trim()?.length ? prev : label));
        }}
      />

      {/* Auth modal */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} initialMode="login" />
    </main>
  );
}