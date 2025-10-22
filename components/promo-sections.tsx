"use client"

import Image from "next/image"
import { useLocale } from "next-intl"
import { Button } from "./ui/button"
import { Link } from "@/i18n/routing"

type PromoKey = "leto" | "moloko"
type LocaleKey = "uz" | "ru"

interface LocaleText {
  uz: string
  ru: string
  en?: string
}

export function PromoSections() {
  const rawLocale = useLocale()
  // "ru", "ru-RU" -> "ru"; boshqasi "uz"
  const lang: LocaleKey = rawLocale?.toLowerCase().startsWith("ru") ? "ru" : "uz"

  const CTA_LABEL: Record<LocaleKey, string> = {
    uz: "Brandga o‘tish",
    ru: "Перейти к бренду",
  }

  const promos: Array<{
    title: LocaleText
    desc: LocaleText
    key: PromoKey
    // Promo sahifa (karta bo'ylab bosilganda shu ochiladi)
    href: string
    // Brand detail sahifa uchun slug
    brandSlug: string
    gradient: string
    bgImg: string
    companyImg?: string
  }> = [
      {
        title: { uz: "Kuban Leto", ru: "Кубанское Лето", en: "Kuban Leto" },
        desc: {
          uz: "Mahsulotlarning o'ziga xos xususiyati eng yuqori sifat va ekologik tozalikdir",
          ru: "Отличительная особенность продукции — высокое качество и экологичность",
          en: "Distinctive features are top quality and eco-friendliness",
        },
        key: "leto",
        href: "/promos/leto",
        brandSlug: "kuban-leto", // BRAND DETAIL SLUG
        gradient: "from-pink-100 to-pink-200",
        bgImg: "/kubanskiy-leto.png",
        companyImg: "/leto.jpg",
      },
      {
        title: { uz: "Molochnaya Rechka", ru: "Молочная Речка" },
        desc: {
          uz: "Sut daryosi ajoyib ta'm, tabiiy sutning afzalliklari va eng yaqin kishilarga salomatlik beradi",
          ru: "«Молочная речка» — отличный вкус, польза натурального молока и здоровье близким",
          en: "Great taste, benefits of natural milk, and health for loved ones",
        },
        key: "moloko",
        href: "/promos/moloko-rechka",
        brandSlug: "molochnaya-rechka", // BRAND DETAIL SLUG
        gradient: "from-blue-100 to-blue-200",
        bgImg: "/molochniy-rechka.png",
        companyImg: "/moloko.png",
      },
    ]

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promos.map((p) => {
          const titleText = p.title[lang] || p.title.uz || p.title.ru || ""
          const descText = p.desc[lang] || p.desc.uz || p.desc.ru || ""
          const logoSrc = p.companyImg && p.companyImg !== "/" ? p.companyImg : "/placeholder-logo.svg"
          const cta = CTA_LABEL[lang]

          return (
            <article key={p.key} className="group relative">
              {/* Karta fon + rasmi */}
              <div
                className="relative rounded-2xl overflow-hidden min-h-[220px] md:min-h-[320px]"
                style={{
                  backgroundImage: `url("${p.bgImg}")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                {/* Stretched link: butun kartani PROMO sahifaga olib boradi */}
                <Link
                  href={p.href as any}
                  aria-label={titleText}
                  className="absolute inset-0 z-10"
                />

                {/* Kontent (promo link ustida ko‘rinishi uchun yuqori z-index, lekin kliklar defaultda o‘tmaydi) */}
                <div className="absolute inset-0 z-20 pointer-events-none flex items-end justify-between gap-4 p-4 md:p-6">
                  {/* Chap blok */}
                  <div className="flex-1 h-full flex flex-col justify-between max-w-[60%]">
                    <h2 className="!text-xl !text-[#BC4B68] !font-[EBGaramond] md:text-sm ">
                      Top Brend
                    </h2>

                    <div>
                      <h3 className="mt-1 text-lg md:text-2xl font-semibold text-gray-900">
                        {titleText}
                      </h3>
                      <p className="mt-2 text-sm md:text-base text-gray-800/80">
                        {descText}
                      </p>
                    </div>

                    {/* CTA: faqat shu tugma brend DETAIL sahifasiga olib boradi */}
                    <Button asChild className="mt-4 w-[188px] bg-black hover:bg-black/90 pointer-events-auto">
                      <Link
                        href={{ pathname: "/brands/[slug]", params: { slug: p.brandSlug } }}
                        aria-label={cta}
                        onClick={(e) => e.stopPropagation()} // promo-linkga ko'tarilmasin
                      >
                        {cta}
                      </Link>
                    </Button>
                  </div>

                  {/* O‘ngdagi logo doirasi */}
                  <div className="relative w-[180px] md:w-[250px] aspect-square rounded-full bg-white shadow-md self-center pointer-events-none">
                    <Image
                      src={logoSrc}
                      alt={titleText || p.key}
                      fill
                      className="object-contain p-6 rounded-full"
                      sizes="(min-width: 768px) 250px, 180px"
                      priority={p.key === "leto"}
                    />
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
