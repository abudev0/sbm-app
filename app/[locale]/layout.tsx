import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "next-themes"
import { Toaster } from "react-hot-toast"
import { Suspense } from "react"
import "./globals.css"
import { Header } from "@/components/header"
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server"
import { Footer } from "@/components/footer"
import { LanguageInitializer } from "@/components/locale-initializer"
import TelegramTokenHandler from "@/components/TelegramTokenHandler"

const geistSans = GeistSans
const geistMono = GeistMono
export const metadata: Metadata = {
  title: {
    default: "SBM",
    template: "%s | SBM"
  },
  description: "Created with InnoSoft systems",
  generator: "innosoft-systems.uz",
  // optional: favicon, themeColor, etc.
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  openGraph: {
    type: "website",
    siteName: "SBM",
    locale: "uz_UZ",
    url: "https://sbm.uz", // change to your real domain
    title: "SBM",
    description: "Created with InnoSoft systems"
  }
}

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode,
  params: { locale: string };
}>) {
  const messages = await getMessages({ locale });
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FFF7E4]`}>
        <Suspense fallback={null}>
          <NextIntlClientProvider messages={messages} locale={locale}>
              <TelegramTokenHandler />
              <LanguageInitializer />
              <Header />
              {children}
              <Footer />
              <Toaster />
          </NextIntlClientProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
