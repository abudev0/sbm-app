import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/api/news";
import { getTranslations } from "next-intl/server";
import { cache } from "react";
import Image from "next/image";
import { ArticleShareBar } from "@/components/news/article-share-bar";
import { Breadcrumbs } from "@/components/news/breadcrumbs";
import { ArticleMetaPanel } from "@/components/news/article-meta-panel";

type Locale = "uz" | "ru" | "en"; // Adjust if needed
type Params = { params: { locale: Locale; slug: string } };

export const dynamic = "force-dynamic";

const fetchNewsItem = cache(async (slug: string, locale: Locale) => {
  if (!slug) return null;
  return await getNewsBySlug(slug, locale);
});

function pickLocalized(value: any, locale: Locale, fallback: Locale = "uz"): string {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  const v = value[locale] || value[fallback] || Object.values(value)[0] || "";
  return (typeof v === "string" ? v : "").trim();
}

function buildArticleJsonLd(opts: {
  title: string;
  description: string;
  image?: string;
  slug: string;
  locale: string;
  publishedAt?: string;
  updatedAt?: string;
}) {
  const site = "http://localhost:3000";
  const published = opts.publishedAt || opts.updatedAt || "";
  const modified = opts.updatedAt || opts.publishedAt || published;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: opts.title,
    description: opts.description,
    image: opts.image ? [opts.image] : undefined,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site}/${opts.locale}/news/${opts.slug}`,
    },
    datePublished: published || undefined,
    dateModified: modified || undefined,
    inLanguage: opts.locale,
    publisher: {
      "@type": "Organization",
      name: "Your Company",
      logo: {
        "@type": "ImageObject",
        url: `${site}/logo.png`,
      },
    },
  };
}

function estimateReadingTime(text: string, wpm = 190) {
  const words = text.trim().split(/\s+/).length;
  const min = Math.max(1, Math.round(words / wpm));
  return { minutes: min, words };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = params;
  const item = await fetchNewsItem(slug, locale);
  if (!item) return { title: "News", description: "News item" };

  const resolvedTitle = pickLocalized(item.title, locale) || "News";
  const resolvedDesc = (pickLocalized(item.description, locale) || "News item").slice(0, 160);
  const urlBase = "http://localhost:3000";
  const canonical = `${urlBase}/${locale}/news/${item.slug}`;

  return {
    title: resolvedTitle,
    description: resolvedDesc,
    alternates: {
      canonical,
      languages: {
        uz: `${urlBase}/uz/news/${item.slug}`,
        ru: `${urlBase}/ru/news/${item.slug}`,
        en: `${urlBase}/en/news/${item.slug}`,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description: resolvedDesc,
      url: canonical,
      type: "article",
      images: item.image ? [{ url: item.image, alt: resolvedTitle }] : [],
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description: resolvedDesc,
      images: item.image ? [item.image] : [],
    },
  };
}

export default async function NewsDetailPage({ params: { locale, slug } }: Params) {
  const item = await fetchNewsItem(slug, locale);
  if (!item) notFound();

  const title = pickLocalized(item.title, locale) || "News";
  const rawDescription = pickLocalized(item.description, locale);
  const description = rawDescription || "";
  const image = item.image;
  const publishedAt: string | undefined = item.publishedAt || item.createdAt;
  const updatedAt: string | undefined = item.updatedAt || publishedAt;

  // Server-side date formatting - consistent between SSR and client
  let formattedDate = "";
  if (publishedAt) {
    try {
      formattedDate = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(publishedAt));
    } catch {
      formattedDate = publishedAt;
    }
  }

  let formattedUpdated = "";
  if (updatedAt && updatedAt !== publishedAt) {
    try {
      formattedUpdated = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(updatedAt));
    } catch {
      formattedUpdated = updatedAt;
    }
  }

  const t = await getTranslations("news");
  const postedAtText = formattedDate
    ? (t?.("postedAt", { date: formattedDate }) as string) || formattedDate
    : "";

  const reading = estimateReadingTime(description);
  const siteUrl = "http://localhost:3000";
  const pageUrl = `${siteUrl}/${locale}/news/${item.slug}`;

  // Mock tags (since schema doesn't include them)

  const jsonLd = buildArticleJsonLd({
    title,
    description: description.slice(0, 300),
    image,
    slug: item.slug,
    locale,
    publishedAt,
    updatedAt,
  });

  return (
    <div className=" ">
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { href: `/${locale}`, label: locale === "ru" ? "Главная" : "Bosh sahifa" },
            { href: `/${locale}/news`, label: locale === "ru" ? "Новости" : "Yangiliklar" },
            { label: title },
          ]}
        />
        
        <div className="mt-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
            {title}
          </h1>
          
          <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-neutral-600 dark:text-neutral-400">
            {formattedDate && (
              <time
                dateTime={publishedAt}
                className="inline-flex items-center gap-1.5"
                suppressHydrationWarning
              >
                <span className="i-lucide-calendar size-4" />
                {formattedDate}
              </time>
            )}
            
          </div>
        </div>
        
        {/* Main content grid */}
        <div className="mt-8 grid lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
          <div>
            {/* Featured image with visual enhancement */}
            {image && (
              <div className="relative mb-8 rounded-xl overflow-hidden shadow-xl shadow-amber-900/5 group">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/5 opacity-70 transition z-10"></div>
                
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${image}`}
                  alt={title}
                  width={1200}
                  height={630}
                  priority
                  className="w-full aspect-[16/9] object-cover object-center transition duration-500 "
                />
                
                <div className="absolute bottom-0 left-0 p-4 sm:p-6 z-20">
                  <div className="inline-flex items-center rounded-full bg-amber-500/90 px-3 py-1 text-sm text-white shadow-lg backdrop-blur-sm">
                    <span className="i-lucide-newspaper size-4 mr-1.5" />
                    {locale === "ru" ? "Новость" : "Yangilik"}
                  </div>
                </div>
              </div>
            )}
            
            {/* Article content */}
            <article className="prose prose-lg dark:prose-invert prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-relaxed prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:transition-colors prose-img:rounded-xl mx-auto">
              <div className="whitespace-pre-line text-neutral-700 dark:text-neutral-300">
                {description}
              </div>
            </article>
          </div>
          
          {/* Sidebar */}
          <aside className="space-y-6  lg:top-24 self-start">
            <ArticleShareBar
              locale={locale}
              title={title}
              url={pageUrl}
              description={description.slice(0, 140)}
            />
            
            <ArticleMetaPanel
              publishedAt={formattedDate}
              updatedAt={formattedUpdated}
              readingMinutes={reading.minutes}
              words={reading.words}
              locale={locale}
              postedAtText={postedAtText}
            />
            

          </aside>
        </div>
      </div>
      
      {/* JSON-LD */}
      <script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </div>
  );
}