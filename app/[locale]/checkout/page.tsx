"use client";

import dynamic from "next/dynamic";

const CheckoutPage = dynamic(() => import("@/components/checkout/checkout-page"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className=" ">
      <CheckoutPage />
    </div>
  );
}