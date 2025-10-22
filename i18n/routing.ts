import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: ["uz", "ru"],
  defaultLocale: "uz",
  localeDetection: true,
  pathnames: {
    "/about": "/about",
    "/products/[slug]": "/products/[slug]",
    "/brands": "/brands",
    "/brands/[slug]": "/brands/[slug]",
    "/products": "/products",
    '/': '/',
    '/contact': '/contact',
    '/delivery-payment': '/delivery-payment',
    '/sales': '/sales',
    '/sales/[slug]': '/sales/[slug]',
    '/news': '/news',
    '/news/[slug]': '/news/[slug]',
    '/cart': '/cart',
    '/favorites': '/favorites',
    '/help':'/help',
    '/checkout': '/checkout',
    '/profile': '/profile',
  },
})


export const { Link, redirect, usePathname, useRouter } = createNavigation(routing)