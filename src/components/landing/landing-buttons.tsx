"use client"

import { ArrowRight, Sparkles } from "lucide-react"
import { AuthRequiredLink } from "@/components/auth/auth-required-link"

export function LandingHeroButtons() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
      <AuthRequiredLink
        href="/shop"
        requireAuth={true}
        className="group px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-95 active:scale-[0.97] flex items-center gap-2.5"
        style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
      >
        Jelajahi Koleksi
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </AuthRequiredLink>
      <button
        className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:bg-[#F3E0CC]"
        style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
        onClick={() => {
          document.getElementById("umkm-section")?.scrollIntoView({ behavior: "smooth" })
        }}
      >
        Kenali UMKM Kami
      </button>
    </div>
  )
}

export function ViewAllShopButton() {
  return (
    <AuthRequiredLink
      href="/shop"
      requireAuth={true}
      className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors hover:text-[#261200]"
      style={{ color: "#6B4E2A" }}
    >
      Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
    </AuthRequiredLink>
  )
}

export function ProductActionButtons() {
  return (
    <div className="flex gap-2">
      <AuthRequiredLink
        href="/try-on"
        requireAuth={true}
        className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors hover:bg-[#F3E0CC] text-center"
        style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
      >
        Coba
      </AuthRequiredLink>
      <AuthRequiredLink
        href="/shop"
        requireAuth={true}
        className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all hover:brightness-95 text-center"
        style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
      >
        Tambah
      </AuthRequiredLink>
    </div>
  )
}

export function TryOnButton() {
  return (
    <AuthRequiredLink
      href="/try-on"
      requireAuth={true}
      className="flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold tracking-wide transition-all hover:bg-[#FFDDB8]"
      style={{ border: "1px solid #867462", color: "#261200" }}
    >
      <Sparkles className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
      Mulai Virtual Try-On
    </AuthRequiredLink>
  )
}
