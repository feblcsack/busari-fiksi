"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Shirt, Sparkles, User } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/closet", label: "Closet", icon: Shirt },
  { href: "/try-on", label: "Try On", icon: Sparkles },
  { href: "/dashboard", label: "Account", icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile: fixed bottom full-width bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div
          className="flex items-center justify-around px-2 py-2 mx-3 mb-3 rounded-2xl"
          style={{
            background: "rgba(34, 31, 29, 0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(240, 192, 77, 0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(240,192,77,0.1)",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                  isActive
                    ? "text-[#F5C451]"
                    : "text-[#9b8f7c] hover:text-[#e8e1dd]"
                )}
              >
                <div className="relative">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive && "drop-shadow-[0_0_6px_rgba(245,196,81,0.6)]"
                    )}
                    strokeWidth={isActive ? 2.5 : 1.8}
                  />
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#F5C451]" />
                  )}
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-none tracking-wide transition-all duration-200",
                    isActive ? "opacity-100" : "opacity-60"
                  )}
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop: floating pill at bottom center */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <div
          className="flex items-center gap-1 px-3 py-2 rounded-full"
          style={{
            background: "rgba(28, 25, 23, 0.88)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(240, 192, 77, 0.2)",
            boxShadow:
              "0 16px 48px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(240,192,77,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm",
                  isActive
                    ? "bg-[#F5C451] text-[#3f2e00] font-semibold"
                    : "text-[#9b8f7c] hover:text-[#e8e1dd] hover:bg-white/5"
                )}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav */}
      <div className="h-24 md:h-20" />
    </>
  )
}