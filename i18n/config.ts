import { getRequestConfig } from "next-intl/server"

export const locales = ["uz", "ru"] as const
export const defaultLocale = "uz" as const

export default getRequestConfig(async ({ locale }) => {
  const l = (locales.includes(locale as any) ? locale : defaultLocale) as typeof locales[number]
  return {
    locale: l,
    messages: (await import(`../messages/${l}.json`)).default,
  }
})