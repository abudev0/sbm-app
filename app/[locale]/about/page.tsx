import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { UzbMap } from "@/components/uzb-map";

type PageProps = { params: { locale: string } };

export async function generateMetadata({ params: { locale } }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "AboutPage" });
    return {
        title: t("meta.title"),
        description: t("meta.description"),
    };
}

export default async function AboutPage({ params: { locale } }: PageProps) {
    const t = await getTranslations("AboutPage");

    const paragraphs: string[] = [
        t("p1"),
        t("p2"),
        t("p3"),
    ];

    return (
        <div className="min-h-screen  ">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">


                {/* Top: Text + Map */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left: Text */}
                    <div className="p-5 sm:p-6">
                        <div className="space-y-4 text-[15px] leading-7 text-black font-bold">
                            {paragraphs.map((txt, i) => (
                                <p key={i}>{txt}</p>
                            ))}
                        </div>
                    </div>

                    {/* Right: Map with numbered markers */}
                    <div className="rounded-2xl overflow-hidden ">
                        <UzbMap />
                    </div>
                </div>

                {/* Bottom: Quote */}
                <div className="mt-8">
                    <blockquote className="border border-gray-900  px-4 sm:px-6 py-4 shadow-sm text-center italic text-gray-800">
                        “{t("principle")}”
                    </blockquote>
                </div>
            </div>
        </div>
    );
}