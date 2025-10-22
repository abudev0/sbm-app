"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/routing"
import { Home, ShoppingBag, ShoppingCart, Heart, User } from "lucide-react"
import { useAuthStore } from "@/store/auth-store"



type DockItemProps = {
  href?: string
  label: string
  active?: boolean
  onClick?: () => void
  icon: React.ReactNode
}

const DockItem = ({ href, label, active = false, onClick, icon }: DockItemProps) => {
  const baseBtn = "flex flex-col items-center justify-center gap-1 flex-1 min-w-0 text-center select-none"
  const iconWrap = active
    ? "bg-amber-400 text-white rounded-full p-2 shadow-sm"
    : "text-neutral-700"

  const content = (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${baseBtn} w-full focus:outline-none`}
    >
      <span className={`${iconWrap} inline-flex items-center justify-center`}>
        {icon}
      </span>
      <span className="text-[13px] leading-tight text-neutral-800 truncate">{label}</span>
    </button>
  )

  if (href && !onClick) {
    return (
      <li className="flex-1">
        <Link href={href as any} className="inline-flex w-full">
          {content}
        </Link>
      </li>
    )
  }

  return <li className="flex-1">{content}</li>
}

export function Footer() {
  const tDock = useTranslations("footerNav")
  const pathname = usePathname() || "/"
  const router = useRouter()
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  const [spacerHeight] = useState(96)

  const isActive = (href: string) => {
    const clean = pathname.replace(/^\/(uz|ru)(?=\/|$)/, "") || "/"
    if (href === "/") return clean === "/"
    return clean.startsWith(href)
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  return (
    <>
      <div className="md:hidden bg-[#FFF7E4]" style={{ height: spacerHeight }} aria-hidden />

      <nav
        className="fixed inset-x-0 bottom-0 z-[50] md:hidden pointer-events-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label={tDock("ariaBottomNav")}
      >
        <div className="flex flex-col items-center pointer-events-auto">
          <div className="mx-4 w-full">
            <div
              className="rounded-2xl border-2 border-amber-400 bg-white px-3 py-3 shadow-sm"
              role="navigation"
            >
              <ul className="flex items-center justify-between gap-2">
                <DockItem
                  href="/"
                  label={(tDock("home") as string) ?? "Bosh Sahifa"}
                  active={isActive("/")}
                  icon={<Home className="h-6 w-6" />}
                />
                <DockItem
                  href="/products"
                  label={(tDock("products") as string) ?? "Mahsulotlar"}
                  active={isActive("/products")}
                  icon={<ShoppingBag className="h-6 w-6" />}
                />
                <DockItem
                  href="/cart"
                  label={(tDock("cart") as string) ?? "Savat"}
                  active={isActive("/cart")}
                  icon={<ShoppingCart className="h-6 w-6" />}
                />
                <DockItem
                  href="/favorites"
                  label={(tDock("favorites") as string) ?? "Sevimlilar"}
                  active={isActive("/favorites")}
                  icon={<Heart className="h-6 w-6" />}
                />
                <DockItem
                  label={(tDock("account") as string) ?? "Profil"}
                  active={isActive("/profile")}
                  onClick={handleProfileClick}
                  icon={<User className="h-6 w-6" />}
                />
              </ul>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Footer