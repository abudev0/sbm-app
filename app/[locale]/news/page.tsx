import type { Metadata } from "next";
import { getNews } from "@/lib/api/news";
import { NewsList } from "@/components/news-list";
import { notFound } from "next/navigation";

type Params = { params: { locale: 'uz'|'ru'} }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const titles = { uz: "Yangiliklar | SBM", ru: "Новости | SBM" };
  const desc = {
    uz: "Eng so'nggi kompaniya yangiliklari",
    ru: "Последние новости компании",
    en: "Latest company news"
  };
  return {
    title: titles[params.locale],
    description: desc[params.locale],
    openGraph: {
      title: titles[params.locale],
      description: desc[params.locale],
      type: "website"
    }
  };
}

export default async function NewsPage({ params: { locale } }: Params) {
  const data = await getNews(locale);
  if (!data) return notFound();

  return (
    <div className=" ">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl font-bold mb-6">
          {locale === 'ru' ? "Новости" : "Yangiliklar"}
        </h1>
        <NewsList items={data} />
      </main>
    </div>
  );
}