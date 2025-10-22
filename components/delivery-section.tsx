"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { ContactForm } from "./contact-form";
import { Check, CreditCard, MapPin } from "lucide-react";

export function DeliverySection() {
  const t = useTranslations("Delivery");

  // --- Safely get methods as an array (supports both array and flat keys) ---
  let methods: string[] = [];
  const raw = t.raw("payment.methods") as unknown;

  if (Array.isArray(raw)) {
    methods = raw as string[];
  } else {
    // flat keys fallback (add/remove as many as you have)
    methods = [
      t("payment.method1"),
      t("payment.method2"),
      t("payment.method3"),
    ].filter(Boolean);
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-bold mb-4">{t("title")}</h2>
      <p className="mb-6 text-gray-700">{t("description")}</p>

      <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
        {/* Left block */}
        <div className="space-y-6">
          {/* Delivery info */}
          <div>
            <div className="flex items-center mb-4 space-x-3">
              <MapPin size={30} color="#FFC502" />
              <h3 className="text-lg font-semibold  leading-[30px]">{t("delivery.title")}</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <div className="flex items-center space-x-2">
                <Check size={20} color="#ffd500" />
                <li className="list-none">{t("delivery.city")}</li>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={20} color="#ffd500" />
                <li className="list-none">{t("delivery.price")}</li>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={20} color="#ffd500" />
                <li className="list-none">{t("delivery.time")}</li>
              </div>
              <div className="flex items-center space-x-2">
                <Check size={20} color="#ffd500" />
                <li className="list-none">{t("delivery.hours")}</li>
              </div>
            </ul>
          </div>

          {/* Payment info */}
          <div>
            <div className="flex items-center mb-4 space-x-3">
              <CreditCard size={30} color="#FFC502" />
              <h3 className="text-lg font-semibold mb-2">{t("payment.title")}</h3>
            </div>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {methods.map((m, i) => (
                <div className="flex items-center space-x-2" key={i}>
                  <Check size={20} color="#ffd500" />
                  <li className="list-none">{m}</li>
                </div>
              ))}
            </ul>
          </div>
        </div>

        {/* Right block — rasm */}
        <div className="relative w-80 h-80 mx-auto">
          <Image
            src="/delivery.png"
            alt="Delivery illustration"
            fill
            className="object-contain"
            sizes="320px"
          />
        </div>
      </div >

      {/* Contact form */}
      <ContactForm
        phonePlaceholder={t("form.phonePlaceholder")}
        emailPlaceholder={t("form.emailPlaceholder")}
        messagePlaceholder={t("form.messagePlaceholder")}
        submitLabel={t("form.submitLabel")}
        successLabel={t("form.successLabel")}
        errorLabel={t("form.errorLabel")}
      />
    </section>
  );
}
