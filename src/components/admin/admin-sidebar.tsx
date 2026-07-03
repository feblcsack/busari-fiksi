"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Package, Users, Star, Activity, LogOut, Shield, ClipboardList } from "lucide-react"
import { cn } from "@/lib/utils"
import { signOut } from "@/actions/auth"
import { Profile } from "@/types"

interface AdminSidebarProps {
  profile: Profile
  pendingCount?: number
}

export function AdminSidebar({ profile, pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true, badge: 0 },
    { href: "/admin/product-reviews", label: "Antrean Review", icon: ClipboardList, exact: false, badge: pendingCount },
    { href: "/admin/products", label: "Semua Produk", icon: Package, exact: false, badge: 0 },
    { href: "/admin/reviews", label: "Review Produk", icon: Star, exact: false, badge: 0 },
    { href: "/admin/users", label: "Pengguna", icon: Users, exact: false, badge: 0 },
    { href: "/admin/diagnostics", label: "Diagnostik", icon: Activity, exact: false, badge: 0 },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A"

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 flex-col z-40"
        style={{ background: "#FFF8F3", borderRight: "1px solid #D5C3B0" }}>

        {/* Logo area */}
        <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6B4E2A" }}>
              <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="font-bold tracking-wider text-sm" style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif" }}>
              BUSARI
            </span>
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>
            Admin Panel
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group",
                  isActive ? "font-semibold" : "hover:bg-black/5"
                )}
                style={{
                  color: isActive ? "#6B4E2A" : "#52432F",
                  background: isActive ? "rgba(107,78,42,0.08)" : "transparent",
                  fontFamily: "Hanken Grotesk, sans-serif",
                }}>
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                  {label}
                </div>
                {badge > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none"
                    style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User card + logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
            style={{ background: "rgba(107,78,42,0.04)" }}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                style={{ background: "rgba(107,78,42,0.12)", color: "#6B4E2A" }}>
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: "#201A14" }}>
                {profile?.full_name ?? "Admin"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "#6B4E2A" }}>
                {profile?.email ?? ""}
              </p>
            </div>
          </div>
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all hover:bg-black/5 mb-1"
            style={{ color: "#52432F", fontFamily: "Hanken Grotesk, sans-serif" }}>
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0" strokeWidth={1.8} />
            Ke Dashboard Seller
          </Link>
          <form action={signOut}>
            <button type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-50"
              style={{ color: "#BA1A1A", fontFamily: "Hanken Grotesk, sans-serif" }}>
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile header ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(255,248,243,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#6B4E2A" }}>
            <Shield className="w-3 h-3 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold" style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif" }}>
            Admin
          </span>
        </div>
        <nav className="flex gap-1">
          {navItems.map(({ href, label, icon: Icon, exact, badge }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className="relative p-2 rounded-lg transition-all"
                style={{
                  color: isActive ? "#6B4E2A" : "#867462",
                  background: isActive ? "rgba(107,78,42,0.08)" : "transparent"
                }}
                title={label}>
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
                {badge > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                    style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile top spacer */}
      <div className="md:hidden h-14" />
    </>
  )
}
