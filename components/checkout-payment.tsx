"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { useTranslations } from "next-intl";

export default function CheckoutPayment() {
  const t = useTranslations("Checkout.payment");

  return (
    <section aria-labelledby="payment-info" className="space-y-3 mt-5">
      <div
        id="payment-info"
        className="inline-flex items-center gap-2 rounded-lg bg-neutral-800 text-white px-3 py-2 text-[14px] leading-snug"
        role="note"
        aria-live="polite"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-neutral-700">
          <CreditCard className="h-4 w-4" />
        </span>
        <p>{t("banner")}</p>
      </div>
    </section>
  );
}