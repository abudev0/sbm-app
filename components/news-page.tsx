// components/news-page.tsx
"use client"

import Image from "next/image"
import { Link } from "@/i18n/routing"
import { useLocale, useTranslations } from "next-intl"

// ===== Types =====
type LocaleCode = "uz" | "ru"
type Translation = { locale: LocaleCode; title: string; excerpt: string }
type NewsItem = {
    id: string
    slug: string
    image: string
    publishedAt: string // ISO
    translations: Translation[]
}

// ===== Demo data (2 til) =====
const demoNews: NewsItem[] = [
    {
        id: "1",
        slug: "delivery-updates-march",
        image: "/images/news/van.png",
        publishedAt: "2025-03-28T10:58:00.000Z",
        translations: [
            {
                locale: "uz",
                title: "Yangi yetkazib berish yo‘nalishlari",
                excerpt:
                    "Lorem Ipsum t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). matni 1500-yillardan beri ishlatiladi. Qiziqqanlar uchun 1.10.32 va 1.10.33 qismlari keltirilgan...",
            },
            {
                locale: "ru",
                title: "Новые направления доставки",
                excerpt:
                    "Текст t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). Lorem Ipsum используется с 1500-х годов. Для интересующихся приведены разделы 1.10.32 и 1.10.33...",
            },
        ],
    },
    {
        id: "2",
        slug: "topliska-collab",
        image: "/images/news/van.png",
        publishedAt: "2025-03-28T10:58:00.000Z",
        translations: [
            {
                locale: "uz",
                title: "Topлишка bilan hamkorlik",
                excerpt:
                    "Lorem Ipsum matni 1500-yillardan beri ishlatiladi. Qiziqqanlar uchun 1.10.32 va 1.10.33 qismlari keltirilgan...",
            },
            {
                locale: "ru",
                title: "Сотрудничество с Топлишка",
                excerpt:
                    "Текст Lorem Ipsum используется с 1500-х годов. Для интересующихся приведены разделы 1.10.32 и 1.10.33...",
            },
        ],
    },
    {
        id: "3",
        slug: "dobraya-burenka-partnership",
        image: "/images/news/van.png",
        publishedAt: "2025-03-28T10:58:00.000Z",
        translations: [
            {
                locale: "uz",
                title: "Добрая Бурёнка: yangi kelishuv",
                excerpt:
                    "Lorem Ipsum matni 1500-yillardan beri ishlatiladi. Qiziqqanlar uchun 1.10.32 va 1.10.33 qismlari keltirilgan...",
            },
            {
                locale: "ru",
                title: "Добрая Бурёнка: новое соглашение",
                excerpt:
                    "Текст Lorem Ipsum используется с 1500-х годов. Для интересующихся приведены разделы 1.10.32 и 1.10.33...",
            },
        ],
    },
    {
        id: "4",
        slug: "selo-zelenoe-assortment",
        image: "/images/news/van.png",
        publishedAt: "2025-03-28T10:58:00.000Z",
        translations: [
            {
                locale: "uz",
                title: "Село Зелёное assortiment kengaydi",
                excerpt:
                    "Lorem Ipsum t is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like). matni 1500-yillardan beri ishlatiladi. Qiziqqanlar uchun 1.10.32 va 1.10.33 qismlari keltirilgan...",
            },
            {
                locale: "ru",
                title: "Село Зелёное: расширили ассортимент",
                excerpt:
                    "Текст Lorem Ipsum используется с 1500-х годов. Для интересующихся приведены разделы 1.10.32 и 1.10.33...",
            },
        ],
    },
    {
        id: "5",
        slug: "sherin-arrival",
        image: "/images/news/van.png",
        publishedAt: "2025-03-28T10:58:00.000Z",
        translations: [
            {
                locale: "uz",
                title: "SHERIN brendi — sotuvda",
                excerpt:
                    "Lorem Ipsum matni 1500-yillardan beri ishlatiladi. Qiziqqanlar uchun 1.10.32 va 1.10.33 qismlari keltirilgan...",
            },
            {
                locale: "ru",
                title: "Бренд SHERIN — в продаже",
                excerpt:
                    "Текст Lorem Ipsum используется с 1500-х годов. Для интересующихся приведены разделы 1.10.32 и 1.10.33...",
            },
        ],
    },
]

// ===== Helpers =====
function formatDateTime(date: Date, locale: string) {
    const dateLabel = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    }).format(date)
    const timeLabel = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date)
    return { dateLabel, timeLabel }
}

function pickTranslation(item: NewsItem, locale: LocaleCode) {
    return item.translations.find((tr) => tr.locale === locale) ?? item.translations[0]
}

// ===== UI: Card (client) =====
function Card({ item, locale }: { item: NewsItem; locale: LocaleCode }) {
    const t = useTranslations("news")
    const tr = pickTranslation(item, locale)
    const d = new Date(item.publishedAt)
    const { dateLabel, timeLabel } = formatDateTime(d, locale)

    return (
        <li className=" p-3 sm:p-4 ">
            <Link
                href={{ pathname: "/news/[slug]", params: { slug: item.slug } }}
                className="flex gap-3 sm:gap-4 flex-col sm:flex-row items-center sm:items-start"
            >
                <div className="relative h-30 w-50 sm:h-40 sm:w-60 border border-gray-600 rounded">
                    <Image
                        src={item.image}
                        alt={tr.title}
                        fill
                        className="object-contain"
                    />
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between items-start min-h-40">
                    {/* <h3 className="text-[15px] sm:text-[16px] font-semibold text-neutral-900 line-clamp-1">
                        {tr.title}
                    </h3> */}
                    <p className="mt-1 text-[16px] sm:text-[16px] text-black leading-6 line-clamp-5">
                        {tr.excerpt}
                    </p>
                    <p className="mt-2 sm:mt-3 text-[12px] text-neutral-400 self-end">
                        {t("postedAt", { date: dateLabel, time: timeLabel })}
                    </p>
                </div>
            </Link>
            <hr className="mt-6 " />
        </li>
    )
}

// ===== PAGE (client) =====
export default function NewsPage() {
    const locale = useLocale() as LocaleCode
    const t = useTranslations("news")

    return (
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-4">
                {t("title")}
            </h1>

            <ul className="space-y-3 sm:space-y-4">
                {demoNews.map((item) => (
                    <Card key={item.id} item={item} locale={locale} />
                ))}
            </ul>
        </main>
    )
}
