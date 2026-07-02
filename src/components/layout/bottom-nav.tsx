"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, ShoppingBag, Sparkles, LayoutDashboard, Package, LogOut, ChevronUp, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/actions/auth"
import { Profile } from "@/types"

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
  { href: "/try-on", label: "Try On", icon: Sparkles },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
]

const accountMenuItems = [
  { href: "/dashboard/products", label: "Produk Saya", icon: Package },
  { href: "/dashboard/profile", label: "Pengaturan Profil", icon: Settings },
]

interface BottomNavProps {
  profile?: Profile | null
}

export function BottomNav({ profile }: BottomNavProps) {
  const pathname = usePathname()
  const [accountOpen, setAccountOpen] = useState(false)
  const dropupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropupRef.current && !dropupRef.current.contains(e.target as Node)) setAccountOpen(false)
    }
    if (accountOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [accountOpen])

  useEffect(() => { setAccountOpen(false) }, [pathname])

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? "U"

  const isAccountActive = pathname.startsWith("/dashboard") || pathname.startsWith("/profile")

  const navPillStyle: React.CSSProperties = {
    background: "rgba(255,248,243,0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid #D5C3B0",
    boxShadow: "0 4px 24px rgba(107,78,42,0.1), 0 0 0 0.5px rgba(107,78,42,0.06)",
  }

  const dropupStyle: React.CSSProperties = {
    background: "#FFF8F3",
    border: "1px solid #D5C3B0",
    boxShadow: "0 -8px 32px rgba(107,78,42,0.12)",
  }

  return (
    <>
      {/* ── MOBILE ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="flex items-center justify-around px-2 py-2 mx-3 mb-3 rounded-2xl" style={navPillStyle}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                  isActive ? "text-[#6B4E2A]" : "text-[#867462] hover:text-[#201A14]")}>
                <div className="relative">
                  <Icon className={cn("w-5 h-5 transition-all duration-200")} strokeWidth={isActive ? 2.5 : 1.8} />
                  {isActive && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6B4E2A]" />}
                </div>
                <span className={cn("text-[10px] font-medium leading-none tracking-wide transition-all duration-200", isActive ? "opacity-100" : "opacity-60")}
                  style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                  {label}
                </span>
              </Link>
            )
          })}

          {/* Account trigger */}
          <div ref={dropupRef} className="relative">
            <button onClick={() => setAccountOpen((v) => !v)}
              className={cn("flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200",
                isAccountActive || accountOpen ? "text-[#6B4E2A]" : "text-[#867462] hover:text-[#201A14]")}>
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name ?? "avatar"}
                    className="w-5 h-5 rounded-full object-cover"
                    style={isAccountActive || accountOpen ? { outline: "1.5px solid #6B4E2A", outlineOffset: "1px" } : {}} />
                ) : (
                  <>
                    <User className={cn("w-5 h-5 transition-all duration-200")} strokeWidth={isAccountActive || accountOpen ? 2.5 : 1.8} />
                    {(isAccountActive || accountOpen) && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6B4E2A]" />}
                  </>
                )}
              </div>
              <span className={cn("text-[10px] font-medium leading-none tracking-wide transition-all duration-200", (isAccountActive || accountOpen) ? "opacity-100" : "opacity-60")}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                Akun
              </span>
            </button>

            {accountOpen && (
              <div className="absolute bottom-full right-0 mb-3 w-56 rounded-2xl overflow-hidden" style={dropupStyle}>
                {profile && (
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #D5C3B0" }}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                        style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif" }}>{profile.full_name ?? "User"}</p>
                      <p className="text-xs truncate" style={{ color: "#867462", fontFamily: "Hanken Grotesk, sans-serif" }}>{profile.email}</p>
                    </div>
                  </div>
                )}
                <div className="py-1.5">
                  {accountMenuItems.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: pathname === href || pathname.startsWith(href + "/") ? "#6B4E2A" : "#52432F", background: pathname === href || pathname.startsWith(href + "/") ? "rgba(107,78,42,0.06)" : "transparent", fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                      {label}
                    </Link>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #D5C3B0" }} className="p-2">
                  <form action={signOut}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-50"
                      style={{ color: "#BA1A1A", fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                      Keluar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── DESKTOP floating pill ── */}
      <nav className="hidden md:flex fixed bottom-6 left-1/2 -translate-x-1/2 z-50 items-center gap-1">
        <div className="flex items-center gap-1 px-3 py-2 rounded-full" style={navPillStyle}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm",
                  isActive ? "bg-[#6B4E2A] text-white font-semibold" : "text-[#867462] hover:text-[#201A14] hover:bg-black/5")}
                style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
                <span>{label}</span>
              </Link>
            )
          })}

          {/* Desktop account dropdown */}
          <div ref={dropupRef} className="relative">
            <button onClick={() => setAccountOpen((v) => !v)}
              className={cn("flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 text-sm",
                isAccountActive || accountOpen ? "bg-[#6B4E2A] text-white font-semibold" : "text-[#867462] hover:text-[#201A14] hover:bg-black/5")}
              style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <User className="w-4 h-4" strokeWidth={isAccountActive || accountOpen ? 2.5 : 1.8} />
              )}
              <span>{profile?.full_name?.split(" ")[0] ?? "Akun"}</span>
              <ChevronUp className={cn("w-3 h-3 transition-transform duration-200", !accountOpen && "rotate-180")} strokeWidth={2.5} />
            </button>

            {accountOpen && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 rounded-2xl overflow-hidden" style={dropupStyle}>
                {profile && (
                  <div className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: "1px solid #D5C3B0" }}>
                    {profile.avatar_url ? (
                      <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold"
                        style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif" }}>{profile.full_name ?? "User"}</p>
                      <p className="text-xs truncate" style={{ color: "#867462", fontFamily: "Hanken Grotesk, sans-serif" }}>{profile.email}</p>
                    </div>
                  </div>
                )}
                <div className="py-1.5">
                  {accountMenuItems.map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                      style={{ color: pathname === href || pathname.startsWith(href + "/") ? "#6B4E2A" : "#52432F", background: pathname === href || pathname.startsWith(href + "/") ? "rgba(107,78,42,0.06)" : "transparent", fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                      {label}
                    </Link>
                  ))}
                </div>
                <div style={{ borderTop: "1px solid #D5C3B0" }} className="p-2">
                  <form action={signOut}>
                    <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-50"
                      style={{ color: "#BA1A1A", fontFamily: "Hanken Grotesk, sans-serif" }}>
                      <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                      Keluar
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="h-24 md:h-20" />
    </>
  )
}
