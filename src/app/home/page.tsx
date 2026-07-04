import { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight, ShoppingBag, MessageCircle, Star, CheckCircle2,
  Users, Store, Package, Sparkles, TrendingUp, Shield, Zap,
} from "lucide-react"
import { BottomNav } from "../../components/layout/bottom-nav"
import { createClient } from "@/lib/supabase/server"
import { Profile } from "@/types"
import { HomeHeroButtons } from "@/components/home/home-hero-buttons"

export const metadata: Metadata = {
  title: "Busari — Platform UMKM Fashion Indonesia",
  description: "Etalase digital untuk UMKM lokal Indonesia. Daftar gratis, tampilkan produkmu, dan terhubung langsung dengan pembeli via WhatsApp.",
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const UMKM_STATS = [
  { value: "66 Juta", label: "Unit UMKM di Indonesia", source: "BPS 2023" },
  { value: "97%", label: "Tenaga kerja diserap UMKM", source: "Kemenkop 2023" },
  { value: "61%", label: "Kontribusi terhadap PDB", source: "Kemenkop 2023" },
  { value: "15.7%", label: "UMKM sudah go digital", source: "LPEI 2023" },
]

const HOW_IT_WORKS = [
  { step: "01", title: "Daftar Gratis", desc: "Buat akun dengan Google dalam satu klik. Tidak ada formulir panjang.", icon: Store },
  { step: "02", title: "Unggah Produk", desc: "Foto, nama, harga — produkmu masuk antrean review admin.", icon: Package },
  { step: "03", title: "Produk Tampil di Toko", desc: "Setelah disetujui, produkmu langsung bisa ditemukan pembeli.", icon: ShoppingBag },
  { step: "04", title: "Pembeli Menghubungimu", desc: "Transaksi langsung lewat WhatsApp — tanpa perantara platform.", icon: MessageCircle },
]

const BENEFITS = [
  { label: "0% komisi transaksi", icon: Shield },
  { label: "Etalase digital siap pakai", icon: Zap },
  { label: "Virtual Try-On untuk pembeli", icon: Sparkles },
  { label: "Review & ulasan terintegrasi", icon: Star },
  { label: "Dashboard analitik produk", icon: TrendingUp },
  { label: "Terhubung langsung ke WhatsApp", icon: MessageCircle },
]

const TESTIMONIALS = [
  {
    name: "Sari", role: "Batik Madura",
    quote: "Pelanggan dari Jakarta bisa lihat katalog saya. Dulu cuma lewat broadcast WA doang.",
    avatar: "S",
  },
  {
    name: "Budi", role: "Kerajinan Kayu Jepara",
    quote: "Setup-nya 30 menit langsung jadi. Produk saya sudah tampil dan ada yang tanya harga hari itu juga.",
    avatar: "B",
  },
  {
    name: "Rina", role: "Jajanan Tradisional",
    quote: "Tidak ada potongan sama sekali. Semua harga yang saya tulis, itu yang saya terima.",
    avatar: "R",
  },
]

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatCard({ value, label, source }: { value: string; label: string; source: string }) {
  return (
    <div className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
      <p className="text-3xl md:text-4xl font-normal leading-none"
        style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
        {value}
      </p>
      <p className="text-sm leading-snug mt-1" style={{ color: "#52432F" }}>{label}</p>
      <p className="text-[10px] font-semibold tracking-widest uppercase mt-auto pt-2"
        style={{ color: "#D5C3B0", borderTop: "1px solid rgba(107,78,42,0.08)" }}>
        {source}
      </p>
    </div>
  )
}

function GrowthBar() {
  const data = [
    { year: "2019", pct: 13 },
    { year: "2020", pct: 16 },
    { year: "2021", pct: 19 },
    { year: "2022", pct: 20 },
    { year: "2023", pct: 26 },
  ]
  const max = Math.max(...data.map(d => d.pct))
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#867462" }}>
        % UMKM yang sudah go-digital — Sumber: Kemenkop UKM
      </p>
      <div className="flex items-end gap-2 h-24">
        {data.map((d) => (
          <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
            <p className="text-[10px] font-semibold" style={{ color: "#6B4E2A" }}>{d.pct}%</p>
            <div className="w-full rounded-t-lg"
              style={{
                height: `${(d.pct / max) * 72}px`,
                background: d.year === "2023" ? "#6B4E2A" : "rgba(107,78,42,0.2)",
                minHeight: "6px",
              }} />
            <p className="text-[10px]" style={{ color: "#867462" }}>{d.year}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── PAGE (Server Component) ──────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile: Profile | null = null
  if (user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
    profile = data
  }

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <div className="max-w-5xl mx-auto px-5 md:px-10">

        {/* ── HERO ── */}
        <section className="pt-14 pb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{ background: "rgba(107,78,42,0.07)", border: "1px solid rgba(107,78,42,0.15)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#6B4E2A" }} />
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>
              Platform UMKM Indonesia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
            <div className="md:col-span-3">
              <h1 className="text-4xl md:text-[3.25rem] leading-[1.12] mb-5 font-normal"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.025em" }}>
                Etalase Digital untuk{" "}
                <span style={{ color: "#6B4E2A" }}>66 Juta UMKM</span>{" "}
                Indonesia
              </h1>
              <p className="text-sm md:text-base leading-relaxed mb-8 max-w-md" style={{ color: "#867462" }}>
                Tampilkan produkmu ke ribuan pembeli, lengkap dengan fitur Virtual Try-On.
                Tidak ada komisi, tidak perlu keahlian teknis — cukup daftar dan mulai berjualan.
              </p>
              {/* Client component handles hover state */}
              <HomeHeroButtons />
            </div>

            <div className="md:col-span-2 hidden md:block">
              <div className="rounded-2xl p-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                <GrowthBar />
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: "#867462" }}>
                  Hanya <strong style={{ color: "#6B4E2A" }}>15.7%</strong> UMKM yang sudah go-digital.
                  Peluang besar masih terbuka untuk kamu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── UMKM STATS ── */}
        <section className="mb-16">
          <div className="mb-5">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: "#6B4E2A" }}>
              Fakta UMKM Indonesia
            </p>
            <h2 className="text-xl md:text-2xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Tulang punggung ekonomi nasional
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {UMKM_STATS.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </div>
          <p className="text-[10px] mt-3" style={{ color: "#D5C3B0" }}>
            * Data dari BPS, Kemenkop UKM, dan LPEI 2023 — tersedia untuk umum
          </p>
        </section>

        <div className="h-px w-full mb-14" style={{ background: "#D5C3B0" }} />

        {/* ── HOW IT WORKS ── */}
        <section className="mb-16">
          <div className="mb-7">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: "#6B4E2A" }}>Cara Kerja</p>
            <h2 className="text-2xl md:text-3xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Dari daftar sampai penjualan, 4 langkah
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="rounded-2xl p-5 flex gap-4"
                style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(107,78,42,0.08)", border: "1px solid rgba(107,78,42,0.12)" }}>
                  <Icon className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#D5C3B0" }}>{step}</p>
                  <p className="text-sm font-semibold mb-1" style={{ color: "#201A14" }}>{title}</p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#867462" }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── FITUR UNGGULAN ── */}
        <section className="mb-16">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D5C3B0" }}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-7 md:p-9 flex flex-col justify-center" style={{ background: "#6B4E2A" }}>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full mb-5 w-fit"
                  style={{ background: "rgba(255,255,255,0.12)" }}>
                  <Sparkles className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white">Fitur Eksklusif</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-normal mb-3 text-white"
                  style={{ fontFamily: "Libre Caslon Text, serif", letterSpacing: "-0.02em" }}>
                  Virtual Try-On
                </h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>
                  Pembeli bisa melihat tampilan baju di model sebelum membeli.
                  Meningkatkan kepercayaan dan mengurangi retur.
                </p>
                <Link href="/try-on">
                  <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                    style={{ background: "#FFDDB8", color: "#261200" }}>
                    Coba Sekarang <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
              <div className="p-7 md:p-9 flex flex-col justify-center gap-5"
                style={{ background: "#FDF3EC", borderLeft: "1px solid #D5C3B0" }}>
                {BENEFITS.map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(107,78,42,0.08)" }}>
                      <Icon className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm" style={{ color: "#52432F" }}>{label}</span>
                    <CheckCircle2 className="w-4 h-4 ml-auto shrink-0" style={{ color: "rgba(107,78,42,0.3)" }} strokeWidth={1.5} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PELUANG DIGITAL ── */}
        <section className="mb-16">
          <div className="rounded-2xl p-6 md:p-8" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#6B4E2A" }}>
                  Peluang yang Tersisa
                </p>
                <h2 className="text-2xl md:text-3xl font-normal mb-3"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                  84.3% UMKM belum punya etalase digital
                </h2>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "#867462" }}>
                  Dari 66 juta UMKM di Indonesia, baru sekitar 10 juta yang memanfaatkan platform digital.
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Sudah digital", pct: 15.7, color: "#6B4E2A" },
                    { label: "Belum digital", pct: 84.3, color: "#D5C3B0" },
                  ].map(({ label, pct, color }) => (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span style={{ color: "#52432F" }}>{label}</span>
                        <span style={{ color, fontWeight: 600 }}>{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(107,78,42,0.08)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] mt-3" style={{ color: "#D5C3B0" }}>Sumber: LPEI & Kemenkop UKM 2023</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "Rp 8.573 T", label: "Nilai PDB dari UMKM", sub: "61% total PDB nasional" },
                  { value: "117 Juta", label: "Tenaga kerja UMKM", sub: "97% dari total pekerja" },
                  { value: "14.37%", label: "Pertumbuhan UMKM digital", sub: "per tahun, 2020–2023" },
                  { value: "Rp 0", label: "Biaya bergabung Busari", sub: "gratis selamanya" },
                ].map(({ value, label, sub }) => (
                  <div key={label} className="rounded-xl p-4" style={{ background: "rgba(107,78,42,0.04)", border: "1px solid rgba(107,78,42,0.1)" }}>
                    <p className="text-lg font-normal leading-tight"
                      style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{value}</p>
                    <p className="text-xs mt-1 leading-snug" style={{ color: "#52432F" }}>{label}</p>
                    <p className="text-[10px] mt-1" style={{ color: "#D5C3B0" }}>{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-1" style={{ color: "#6B4E2A" }}>Cerita UMKM</p>
            <h2 className="text-2xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Mereka sudah mulai duluan
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TESTIMONIALS.map(({ name, role, quote, avatar }) => (
              <div key={name} className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" fill="#6B4E2A" stroke="#6B4E2A" strokeWidth={1} />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed flex-1" style={{ color: "#52432F" }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "#201A14" }}>{name}</p>
                    <p className="text-[11px]" style={{ color: "#867462" }}>{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mb-10">
          <div className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            style={{ background: "#6B4E2A" }}>
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full blur-3xl opacity-10" style={{ background: "#FFDDB8" }} />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-white opacity-60" strokeWidth={1.5} />
                <span className="text-xs text-white opacity-60">Bergabung dengan ribuan UMKM Indonesia</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-normal mb-1"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#FFFFFF" }}>
                Siap tampil di etalase digital?
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                Gratis selamanya. Tidak ada kartu kredit.
              </p>
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href="/dashboard">
                <button className="px-7 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:brightness-110"
                  style={{ background: "#FFDDB8", color: "#261200" }}>
                  Daftar Sekarang <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/try-on">
                <button className="px-7 py-3.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all"
                  style={{ background: "rgba(255,255,255,0.1)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Sparkles className="w-4 h-4" /> Coba Try-On
                </button>
              </Link>
            </div>
          </div>
        </section>

        <div className="pb-6 text-center">
          <p className="text-[11px]" style={{ color: "#D5C3B0" }}>
            © 2026 · Busari — Platform UMKM Indonesia
          </p>
        </div>
      </div>

      <BottomNav profile={profile} />
    </div>
  )
}
