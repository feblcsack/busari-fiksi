import { Metadata } from "next"
import { Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Profile } from "@/types"
import { BottomNav } from "@/components/layout/bottom-nav"
import { TryOnClient } from "@/components/try-on/try-on-client"

export const metadata: Metadata = {
  title: "Virtual Try-On — Busari",
  description: "Coba tampilan baju di model pria atau wanita sebelum membeli. Teknologi Virtual Try-On eksklusif dari Busari.",
}

export default async function TryOnPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(to bottom, #F3E0CC, #FFF8F3)", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-10 pt-10 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: "rgba(107,78,42,0.08)", border: "1px solid rgba(107,78,42,0.18)" }}>
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
            <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>Virtual Try-On</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-normal mb-2"
            style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
            Coba Dulu, Beli Kemudian
          </h1>
          <p className="text-sm max-w-md" style={{ color: "#867462" }}>
            Pilih model dan baju, lalu lihat bagaimana tampilannya sebelum kamu memutuskan untuk membeli.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 md:px-10 py-8">
        <TryOnClient />
      </div>

      <BottomNav profile={profile} />
    </div>
  )
}
