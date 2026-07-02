"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { LayoutDashboard, Package, Users, Star, Activity, LogOut, Shield } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { signOut } from "@/actions/auth"
import { Profile } from "@/types"

interface AdminSidebarProps {
  profile: Profile
}

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Semua Produk", icon: Package },
  { href: "/admin/reviews", label: "Review Produk", icon: Star },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/diagnostics", label: "Diagnostik", icon: Activity },
]

export function AdminSidebar({ profile }: AdminSidebarProps) {
  const pathname = usePathname()

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "A"

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 flex-col z-40"
        style={{ background: "#FFF8F3", borderRight: "1px solid #D5C3B0" }}>

        {/* Logo */}
        <div className="px-6 pt-8 pb-6" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#6B4E2A" }}>
              <Shield className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <span className="text-sm font-bold tracking-wider" style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif" }}>
              BUSARI
            </span>
          </div>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all",
                  isActive
                    ? "font-semibold"
                    : "hover:bg-black/5"
                )}
                style={{
                  color: isActive ? "#6B4E2A" : "#52432F",
                  background: isActive ? "rgba(107,78,42,0.08)" : "transparent",
                  fontFamily: "Hanken Grotesk, sans-serif",
                }}>
                <Icon className="w-4 h-4 shrink-0" strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2" style={{ background: "rgba(107,78,42,0.04)" }}>
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={32} height={32} unoptimized className="w-8 h-8 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold"
                style={{ background: "rgba(107,78,42,0.12)", color: "#6B4E2A" }}>
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: "#201A14" }}>{profile?.full_name ?? "Admin"}</p>
              <p className="text-[10px] font-semibold tracking-wider uppercase" style={{ color: "#6B4E2A" }}>Administrator</p>
            </div>
          </div>
          <form action={signOut}>
            <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-50"
              style={{ color: "#BA1A1A", fontFamily: "Hanken Grotesk, sans-serif" }}>
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{ background: "rgba(255,248,243,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: "#6B4E2A" }}>
            <Shield className="w-3 h-3 text-white" strokeWidth={2} />
          </div>
          <span className="text-sm font-bold" style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif" }}>Admin</span>
        </div>
        <nav className="flex gap-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/")
            return (
              <Link key={href} href={href}
                className="p-2 rounded-lg transition-all"
                style={{ color: isActive ? "#6B4E2A" : "#867462", background: isActive ? "rgba(107,78,42,0.08)" : "transparent" }}
                title={label}>
                <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 1.8} />
              </Link>
            )
          })}
        </nav>
      </header>

      {/* Mobile spacer */}
      <div className="md:hidden h-14" />
    </>
  )
}
