import Link from "next/link"
import {
  Package,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Star,
  CheckCircle2,
  Users,
  Store,
} from "lucide-react"
import { BottomNav } from "../../components/layout/bottom-nav"

// ── Education / How It Works data ──────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Daftarkan Tokomu",
    desc: "Buat akun gratis dan lengkapi profil butik UMKM kamu dalam hitungan menit.",
    icon: Store,
  },
  {
    step: "02",
    title: "Unggah Produkmu",
    desc: "Tambahkan foto, nama, harga, dan deskripsi produkmu ke etalase digital.",
    icon: Package,
  },
  {
    step: "03",
    title: "Pelanggan Menemukanmu",
    desc: "Katalog publikmu bisa diakses siapa saja, dari mana saja, kapan saja.",
    icon: Users,
  },
  {
    step: "04",
    title: "Transaksi via WhatsApp",
    desc: "Pembeli langsung menghubungimu lewat WhatsApp — tidak ada biaya platform.",
    icon: MessageCircle,
  },
]

const BENEFITS = [
  "Tidak ada komisi transaksi",
  "Etalase digital siap pakai",
  "Terhubung langsung ke WhatsApp",
  "Analitik produk sederhana",
  "Ulasan pembeli terintegrasi",
  "Dukungan UMKM Indonesia",
]

const STATS = [
  { value: "2.4K+", label: "Pelaku UMKM" },
  { value: "18K+", label: "Produk Terdaftar" },
  { value: "0%", label: "Biaya Komisi" },
]

// ── Sparkline decoration ────────────────────────────────────────────────────
function DecoSparkline() {
  const pts = [12, 28, 18, 40, 30, 55, 42, 70, 58, 85, 72, 90]
  const W = 120
  const H = 40
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * W)
  const ys = pts.map((p) => H - (p / 100) * H)
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ")
  const area = `${line} L ${xs[xs.length - 1]} ${H} L ${xs[0]} ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5C451" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F5C451" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#heroGrad)" />
      <path d={line} fill="none" stroke="#F5C451" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="2.5" fill="#F5C451" />
    </svg>
  )
}

export default function HomePage() {
  return (
    <div
      className="min-h-screen pb-28"
      style={{ backgroundColor: "#111009", fontFamily: "Hanken Grotesk, sans-serif" }}
    >
      <div className="max-w-5xl mx-auto px-5 md:px-10">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="pt-14 pb-16">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(245,196,81,0.07)",
              border: "1px solid rgba(245,196,81,0.15)",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#F5C451" }} />
            <span className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#F5C451" }}>
              Platform UMKM Indonesia
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h1
                className="text-4xl md:text-5xl leading-[1.15] mb-5"
                style={{
                  fontFamily: "Libre Caslon Text, serif",
                  color: "#e8e1dd",
                  fontWeight: 400,
                  letterSpacing: "-0.02em",
                }}
              >
                Etalase Digital <span style={{ color: "#F5C451" }}>UMKM Lokal</span> yang Nyata
              </h1>
              <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: "#9b8f7c" }}>
                Tampilkan produkmu ke ribuan pembeli potensial. Tidak perlu keahlian teknis —
                cukup daftar, unggah produk, dan biarkan pelanggan menemukan kamu.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard">
                  <button
                    className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ background: "#F5C451", color: "#3f2e00" }}
                  >
                    Mulai Gratis
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link href="/katalog">
                  <button
                    className="px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all hover:bg-white/5"
                    style={{ background: "transparent", color: "#9b8f7c", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Lihat Katalog
                  </button>
                </Link>
              </div>
            </div>

            {/* Hero visual: stats card + sparkline */}
            <div className="hidden md:block">
              <div
                className="rounded-2xl p-5 relative overflow-hidden"
                style={{ background: "#1a1814", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <p className="text-[10px] font-bold tracking-widest uppercase mb-3" style={{ color: "#4e4635" }}>
                  Pertumbuhan UMKM
                </p>
                <div className="h-10 mb-4">
                  <DecoSparkline />
                </div>
                <div className="flex gap-4">
                  {STATS.map(({ value, label }) => (
                    <div key={label} className="flex-1">
                      <p className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd" }}>
                        {value}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: "#4e4635" }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats (mobile) ───────────────────────────────────────────── */}
        <section className="md:hidden mb-10">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map(({ value, label }) => (
              <div
                key={label}
                className="rounded-2xl p-4 text-center"
                style={{ background: "#1a1814", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd" }}>
                  {value}
                </p>
                <p className="text-[10px] mt-1" style={{ color: "#6b6356" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Divider ──────────────────────────────────────────────────── */}
        <div className="h-px w-full mb-14" style={{ background: "rgba(255,255,255,0.05)" }} />

        {/* ── How It Works ─────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#F5C451", opacity: 0.8 }}>
              Cara Kerja
            </p>
            <h2 className="text-2xl md:text-3xl" style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd", fontWeight: 400 }}>
              Dari daftar sampai penjualan, dalam 4 langkah
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon }) => (
              <div
                key={step}
                className="rounded-2xl p-5 flex gap-4"
                style={{ background: "#1a1814", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(245,196,81,0.08)", border: "1px solid rgba(245,196,81,0.12)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#F5C451" }} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#4e4635" }}>
                    {step}
                  </p>
                  <p className="text-sm font-semibold mb-1.5" style={{ color: "#e8e1dd" }}>
                    {title}
                  </p>
                  <p className="text-[13px] leading-relaxed" style={{ color: "#6b6356" }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Benefits ─────────────────────────────────────────────────── */}
        <section className="mb-16">
          <div
            className="rounded-2xl p-6 md:p-8"
            style={{ background: "rgba(245,196,81,0.05)", border: "1px solid rgba(245,196,81,0.12)" }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#F5C451", opacity: 0.8 }}>
                  Kenapa Bergabung?
                </p>
                <h2 className="text-2xl md:text-3xl mb-3" style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd", fontWeight: 400 }}>
                  Dibangun untuk UMKM, bukan marketplace besar
                </h2>
                <p className="text-sm leading-relaxed" style={{ color: "#9b8f7c" }}>
                  Kami percaya UMKM lokal berhak punya ruang digital yang layak,
                  tanpa dipotong komisi besar atau harus bersaing algoritma.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5">
                {BENEFITS.map((b) => (
                  <div key={b} className="flex items-center gap-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#F5C451" }} strokeWidth={1.5} />
                    <span className="text-sm" style={{ color: "#9b8f7c" }}>
                      {b}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ─────────────────────────────────────────────── */}
        <section className="mb-16">
          <div className="mb-6">
            <p className="text-[10px] font-bold tracking-[0.18em] uppercase mb-2" style={{ color: "#F5C451", opacity: 0.8 }}>
              Cerita UMKM
            </p>
            <h2 className="text-2xl" style={{ fontFamily: "Libre Caslon Text, serif", color: "#e8e1dd", fontWeight: 400 }}>
              Mereka sudah memulai
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                name: "Sari, Batik Madura",
                quote: "Pelanggan dari Jakarta bisa lihat katalog saya sekarang. Dulu cuma lewat broadcast WA.",
                rating: 5,
              },
              {
                name: "Budi, Kerajinan Kayu",
                quote: "Setup-nya cepat banget. Dalam 30 menit toko saya sudah online.",
                rating: 5,
              },
              {
                name: "Rina, Jajanan Tradisional",
                quote: "Tidak ada potongan sama sekali. Semua harga yang saya tulis, itu yang saya dapat.",
                rating: 5,
              },
            ].map(({ name, quote, rating }) => (
              <div
                key={name}
                className="rounded-2xl p-5"
                style={{ background: "#1a1814", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5" fill="#F5C451" stroke="#F5C451" strokeWidth={1} />
                  ))}
                </div>
                <p className="text-[13px] leading-relaxed mb-4" style={{ color: "#9b8f7c" }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="text-xs font-semibold" style={{ color: "#6b6356" }}>
                  {name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ───────────────────────────────────────────────── */}
        <section className="mb-10">
          <div
            className="rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
            style={{ background: "#F5C451" }}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20" style={{ background: "#3f2e00" }} />

            <div className="relative z-10">
              <h2
                className="text-2xl md:text-3xl mb-2"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#3f2e00", fontWeight: 400 }}
              >
                Siap tampil di etalase digital?
              </h2>
              <p className="text-sm" style={{ color: "rgba(63,46,0,0.65)" }}>
                Gratis selamanya. Tidak perlu kartu kredit.
              </p>
            </div>

            <Link href="/dashboard" className="relative z-10 shrink-0">
              <button
                className="px-7 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:brightness-110"
                style={{ background: "#3f2e00", color: "#F5C451" }}
              >
                Daftar Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>

        {/* ── Footer note ──────────────────────────────────────────────── */}
        <div className="pb-6 text-center">
          <p className="text-[11px]" style={{ color: "#4e4635" }}>
            © 2026 · Busari 
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}