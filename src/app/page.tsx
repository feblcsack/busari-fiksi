import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginButton } from "@/components/auth/login-button";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowRight,
  Sparkles,
  Leaf,
  Heart,
  Box,
  MapPin,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Busari — Fashion UMKM Nusantara",
  description: "Platform fashion artisanal Indonesia. Temukan batik, tenun, dan songket dari pengrajin lokal terbaik Nusantara.",
  openGraph: {
    title: "Busari — Fashion UMKM Nusantara",
    description: "Dari tangan pengrajin Nusantara ke lemarimu. Batik, tenun, songket, dan karya lokal terbaik.",
    type: "website",
  },
}

// Batik Kawung ornament — inline SVG, pure geometric
function KawungOrnament({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className="absolute pointer-events-none select-none"
      aria-hidden="true"
    >
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => {
          const cx = col * 40 + 20;
          const cy = row * 40 + 20;
          return (
            <g key={`${row}-${col}`}>
              <ellipse cx={cx} cy={cy - 10} rx="8" ry="12" fill="none" stroke="#6B4E2A" strokeWidth="0.8" opacity={opacity * 2} />
              <ellipse cx={cx + 10} cy={cy} rx="12" ry="8" fill="none" stroke="#6B4E2A" strokeWidth="0.8" opacity={opacity * 2} />
              <ellipse cx={cx} cy={cy + 10} rx="8" ry="12" fill="none" stroke="#6B4E2A" strokeWidth="0.8" opacity={opacity * 2} />
              <ellipse cx={cx - 10} cy={cy} rx="12" ry="8" fill="none" stroke="#6B4E2A" strokeWidth="0.8" opacity={opacity * 2} />
              <circle cx={cx} cy={cy} r="3" fill="none" stroke="#6B4E2A" strokeWidth="0.6" opacity={opacity} />
            </g>
          );
        })
      )}
    </svg>
  );
}

// Mega mendung cloud pattern — top right decoration
function MegaMendungCorner() {
  return (
    <svg
      viewBox="0 0 320 320"
      className="absolute top-0 right-0 w-64 md:w-96 pointer-events-none select-none"
      aria-hidden="true"
    >
      <g opacity="0.12">
        {/* Layered cloud arcs - mega mendung style */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path
            key={i}
            d={`M ${280 - i * 22} 0 Q ${320 - i * 15} ${60 + i * 18}, ${280 - i * 10} ${120 + i * 22} Q ${300 - i * 8} ${180 + i * 16}, ${260 - i * 12} ${240 + i * 10}`}
            fill="none"
            stroke="#6B4E2A"
            strokeWidth={1.5 - i * 0.15}
            strokeLinecap="round"
          />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <ellipse
            key={`c-${i}`}
            cx={290 - i * 18}
            cy={30 + i * 40}
            rx={20 + i * 8}
            ry={14 + i * 5}
            fill="none"
            stroke="#6B4E2A"
            strokeWidth="0.8"
          />
        ))}
      </g>
    </svg>
  );
}

// Parang diagonal pattern for section divider
function ParangDivider() {
  return (
    <div className="w-full overflow-hidden h-6 opacity-20" aria-hidden="true">
      <svg viewBox="0 0 400 24" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
        {Array.from({ length: 20 }).map((_, i) => (
          <path
            key={i}
            d={`M ${i * 20} 24 L ${i * 20 + 12} 0 L ${i * 20 + 20} 24`}
            fill="none"
            stroke="#6B4E2A"
            strokeWidth="0.8"
          />
        ))}
      </svg>
    </div>
  );
}

const crafts = [
  {
    name: "Batik",
    origin: "Jawa",
    desc: "Warisan UNESCO yang lahir dari tangan pengrajin Jawa. Setiap titik lilin menceritakan filosofi hidup.",
    accent: "#6B4E2A",
    icon: "🌿",
    motif: "Kawung · Parang · Mega Mendung",
  },
  {
    name: "Tenun",
    origin: "Nusa Tenggara",
    desc: "Benang demi benang, generasi demi generasi. Kain tenun NTT dan NTB menyimpan identitas suku yang kaya.",
    accent: "#7C5C40",
    icon: "🧵",
    motif: "Ikat · Songke · Doyo",
  },
  {
    name: "Songket",
    origin: "Sumatra",
    desc: "Emas dan perak teranyam dalam sutera — mahkota tekstil Melayu yang dipakai di momen paling bermakna.",
    accent: "#5C6029",
    icon: "✨",
    motif: "Bunga Tabur · Pulir · Pucuk Rebung",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div
      className="min-h-screen flex flex-col selection:bg-[#FFDDB8] selection:text-[#261200]"
      style={{ backgroundColor: "#FFF8F3", color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif" }}
    >

      {/* ══ NAVIGATION ══ */}
      <header
        className="fixed top-0 w-full z-50 px-6 py-4"
        style={{
          background: "linear-gradient(to bottom, rgba(255,248,243,0.97) 0%, rgba(255,248,243,0.0) 100%)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div
            className="text-2xl tracking-[0.2em]"
            style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}
          >
            BUSARI
          </div>
          <nav className="hidden md:flex items-center gap-8">
            {["Shop", "Warisan", "Artisan", "Try-On"].map((item, i) => (
              <Link
                key={item}
                href="#"
                className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-[#261200]"
                style={{ color: i === 0 ? "#201A14" : "#867462" }}
              >
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <LoginButton />
            </div>
          </div>
        </div>
      </header>

      {/* ══ HERO ══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">

        {/* Mega mendung corner decoration */}
        <MegaMendungCorner />

        {/* Bottom-left kawung ornament */}
        <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64">
          <KawungOrnament opacity={0.08} />
        </div>

        {/* Ambient warm glow */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at center, rgba(107,78,42,0.06) 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        {/* Eyebrow */}
        <div className="relative z-10 flex items-center gap-3 mb-8">
          <div className="h-px w-10" style={{ backgroundColor: "#6B4E2A" }} />
          <p
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "#6B4E2A" }}
          >
            Curated UMKM Fashion
          </p>
          <div className="h-px w-10" style={{ backgroundColor: "#6B4E2A" }} />
        </div>

        {/* Headline */}
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] mb-4"
            style={{
              fontFamily: "Libre Caslon Text, serif",
              fontWeight: 400,
              letterSpacing: "-0.02em",
              color: "#201A14",
            }}
          >
            Gaya Lokal,
            <br />
            <span style={{ color: "#6B4E2A" }}>Makna Nyata.</span>
          </h1>

          {/* Sub-tagline bilingual */}
          <p
            className="text-sm md:text-base mt-6 mb-2 max-w-lg mx-auto leading-relaxed"
            style={{ color: "#52432F" }}
          >
            Dari tangan pengrajin Nusantara ke lemarimu.
          </p>
          <p
            className="text-xs mb-10 max-w-sm mx-auto"
            style={{ color: "#867462", fontStyle: "italic", fontFamily: "Libre Caslon Text, serif" }}
          >
            "Every thread carries a story of heritage and pride."
          </p>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="group px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:brightness-95 active:scale-[0.97] flex items-center gap-2.5"
              style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
            >
              Jelajahi Koleksi
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              className="px-8 py-3.5 rounded-full text-sm font-semibold tracking-wide transition-all hover:bg-[#F3E0CC]"
              style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
            >
              Kenali UMKM Kami
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        >
          <div
            className="w-px h-10 animate-pulse"
            style={{ background: "linear-gradient(to bottom, transparent, #6B4E2A)" }}
          />
          <p className="text-[10px] tracking-widest uppercase" style={{ color: "#867462" }}>
            Scroll
          </p>
        </div>
      </section>

      {/* ══ PARANG DIVIDER ══ */}
      <ParangDivider />

      {/* ══ STAT STRIP ══ */}
      <section style={{ backgroundColor: "#FDF3EC", borderTop: "1px solid #D5C3B0", borderBottom: "1px solid #D5C3B0" }}>
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "12 kg", label: "CO₂ Dihemat / Bulan" },
            { value: "8+", label: "Brand Artisan" },
            { value: "100%", label: "Fair Trade" },
            { value: "45%", label: "Bahan Daur Ulang" },
          ].map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <Leaf className="w-4 h-4 mb-1" style={{ color: "#6B4E2A" }} />
              <span
                className="text-3xl md:text-4xl"
                style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}
              >
                {stat.value}
              </span>
              <span
                className="text-[10px] font-semibold tracking-widest uppercase"
                style={{ color: "#867462" }}
              >
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ WARISAN RAGAM BUDAYA ══ */}
      <section className="max-w-7xl mx-auto px-6 py-24 w-full">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-14">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3"
              style={{ color: "#6B4E2A" }}
            >
              Warisan Ragam Budaya
            </p>
            <h2
              className="text-3xl md:text-4xl"
              style={{
                fontFamily: "Libre Caslon Text, serif",
                color: "#201A14",
                letterSpacing: "-0.01em",
              }}
            >
              Dari Sabang sampai Merauke
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed md:text-right" style={{ color: "#867462" }}>
            Tiga tradisi tekstil Indonesia yang masing-masing menyimpan filosofi hidup berbeda.
          </p>
        </div>

        {/* Craft cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {crafts.map((craft) => (
            <div
              key={craft.name}
              className="relative rounded-2xl p-7 overflow-hidden group cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
              style={{
                backgroundColor: "#F8EDE4",
                border: "1px solid #D5C3B0",
                boxShadow: "0 4px 24px rgba(107,78,42,0.08)",
              }}
            >
              {/* BG kawung mini */}
              <div className="absolute bottom-0 right-0 w-32 h-32 opacity-[0.07]">
                <KawungOrnament opacity={1} />
              </div>

              {/* Top accent line */}
              <div
                className="absolute top-0 left-7 right-7 h-px"
                style={{ backgroundColor: craft.accent, opacity: 0.5 }}
              />

              <div className="relative z-10">
                {/* Origin badge */}
                <div className="flex items-center gap-1.5 mb-5">
                  <MapPin className="w-3 h-3" style={{ color: craft.accent }} strokeWidth={1.5} />
                  <span
                    className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: craft.accent }}
                  >
                    {craft.origin}
                  </span>
                </div>

                <h3
                  className="text-3xl mb-3"
                  style={{
                    fontFamily: "Libre Caslon Text, serif",
                    color: "#201A14",
                  }}
                >
                  {craft.name}
                </h3>

                <p className="text-sm leading-relaxed mb-6" style={{ color: "#52432F" }}>
                  {craft.desc}
                </p>

                {/* Motif tags */}
                <div className="flex flex-wrap gap-2">
                  {craft.motif.split(" · ").map((m) => (
                    <span
                      key={m}
                      className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: "#FFDDB8",
                        color: "#52432F",
                        border: "1px solid #D5C3B0",
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PARANG DIVIDER ══ */}
      <ParangDivider />

      {/* ══ UMKM STORY — TERRACOTTA CTA ══ */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Quote card */}
          <div
            className="relative rounded-2xl p-8 md:p-10 overflow-hidden"
            style={{
              backgroundColor: "#FFDCC3",
              border: "1px solid #D5C3B0",
            }}
          >
            {/* Decorative quote mark */}
            <div
              className="absolute top-6 right-8 text-8xl leading-none pointer-events-none select-none"
              style={{
                fontFamily: "Libre Caslon Text, serif",
                color: "rgba(107,78,42,0.12)",
              }}
              aria-hidden="true"
            >
              ❝
            </div>

            <div
              className="w-9 h-9 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "rgba(107,78,42,0.12)" }}
            >
              <Heart className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            </div>

            <blockquote
              className="text-xl md:text-2xl leading-relaxed mb-6 relative z-10"
              style={{
                fontFamily: "Libre Caslon Text, serif",
                color: "#261200",
                fontStyle: "italic",
              }}
            >
              "Setiap pembelian adalah dukungan untuk keluarga pengrajin lokal."
            </blockquote>

            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#52432F" }}>
              Bergabunglah dengan ribuan pembeli yang memilih produk UMKM Indonesia — melestarikan budaya, menghidupi pengrajin, mengurangi fast fashion.
            </p>

            <div
              className="inline-block rounded-xl overflow-hidden"
              style={{ backgroundColor: "rgba(255,248,243,0.8)" }}
            >
              <LoginButton />
            </div>
          </div>

          {/* What is UMKM card */}
          <div
            className="rounded-2xl p-8 md:p-10 relative overflow-hidden"
            style={{
              backgroundColor: "#F8EDE4",
              border: "1px solid #D5C3B0",
            }}
          >
            {/* Kawung bg */}
            <div className="absolute inset-0 opacity-[0.05]">
              <KawungOrnament opacity={1} />
            </div>

            <div
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: "rgba(107,78,42,0.12)" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            </div>

            <h3
              className="relative z-10 text-2xl mb-4"
              style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}
            >
              Apa itu UMKM?
            </h3>
            <p className="relative z-10 text-sm leading-loose mb-6" style={{ color: "#52432F" }}>
              <strong style={{ color: "#6B4E2A" }}>Usaha Mikro, Kecil, dan Menengah</strong> adalah tulang punggung ekonomi kreatif Indonesia. Mereka menjaga teknik tradisional yang diwariskan turun-temurun — dari membatik, menenun, hingga menyongket.
            </p>

            {/* Impact metrics */}
            <div className="relative z-10 grid grid-cols-2 gap-4">
              {[
                { value: "64 juta", label: "unit UMKM di Indonesia" },
                { value: "61%", label: "kontribusi terhadap PDB" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: "rgba(107,78,42,0.08)",
                    border: "1px solid rgba(107,78,42,0.18)",
                  }}
                >
                  <p
                    className="text-xl font-normal mb-1"
                    style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}
                  >
                    {m.value}
                  </p>
                  <p className="text-[11px]" style={{ color: "#867462" }}>
                    {m.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ CURATED COLLECTION ══ */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              className="text-[10px] font-bold tracking-[0.25em] uppercase mb-3"
              style={{ color: "#6B4E2A" }}
            >
              Pilihan Kami
            </p>
            <h2
              className="text-3xl md:text-4xl"
              style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.01em" }}
            >
              Koleksi Pilihan
            </h2>
          </div>
          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors hover:text-[#261200]"
            style={{ color: "#6B4E2A" }}
          >
            Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { name: "Batik Tulis Ayodya", price: "Rp 1.850.000", badge: "TERLARIS", origin: "Solo, Jawa Tengah" },
            { name: "Tenun Ikat NTT", price: "Rp 940.000", badge: null, origin: "Flores, NTT" },
            { name: "Songket Palembang", price: "Rp 2.200.000", badge: "BARU", origin: "Palembang, Sumsel" },
            { name: "Kebaya Modern Kutubaru", price: "Rp 780.000", badge: null, origin: "Yogyakarta, DIY" },
          ].map((item) => (
            <div
              key={item.name}
              className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:translate-y-[-4px]"
              style={{
                backgroundColor: "#FDF3EC",
                border: "1px solid #D5C3B0",
                boxShadow: "0 2px 12px rgba(107,78,42,0.06)",
              }}
            >
              {/* Image area */}
              <div
                className="relative flex flex-col justify-between p-4"
                style={{
                  aspectRatio: "3/4",
                  background: "linear-gradient(135deg, #F3E0CC 0%, #FFDDB8 100%)",
                }}
              >
                {item.badge && (
                  <span
                    className="self-start text-[9px] font-bold px-2.5 py-1 rounded-sm tracking-widest uppercase"
                    style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Placeholder with kawung */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20" aria-hidden="true">
                  <KawungOrnament opacity={0.5} />
                </div>

                <div className="self-end" />
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-[10px] mb-1.5" style={{ color: "#867462" }}>
                  <MapPin className="w-2.5 h-2.5 inline mr-1" strokeWidth={1.5} />
                  {item.origin}
                </p>
                <h4
                  className="text-base mb-1"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}
                >
                  {item.name}
                </h4>
                <p className="text-sm mb-4 font-semibold" style={{ color: "#6B4E2A" }}>
                  {item.price}
                </p>
                <div className="flex gap-2">
                  <button
                    className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-colors hover:bg-[#F3E0CC]"
                    style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
                  >
                    Coba
                  </button>
                  <button
                    className="flex-1 py-2 text-[10px] font-bold tracking-widest uppercase rounded-lg transition-all hover:brightness-95"
                    style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PARANG DIVIDER ══ */}
      <ParangDivider />

      {/* ══ VIRTUAL TRY-ON BANNER ══ */}
      <section className="max-w-7xl mx-auto px-6 py-16 w-full">
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "#F3E0CC",
            border: "1px solid #D5C3B0",
          }}
        >
          {/* Background decoration */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                "radial-gradient(ellipse at 80% 50%, rgba(107,78,42,0.07) 0%, transparent 60%)",
            }}
          />
          <div className="absolute right-0 top-0 bottom-0 w-64 md:w-80">
            <MegaMendungCorner />
          </div>

          <div className="relative z-10 px-8 md:px-14 py-14 md:py-16 max-w-xl">
            <div className="flex items-center gap-2 mb-5">
              <Box className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
              <span
                className="text-[10px] font-bold tracking-[0.25em] uppercase"
                style={{ color: "#6B4E2A" }}
              >
                Inovasi AR
              </span>
            </div>
            <h2
              className="text-3xl md:text-5xl leading-snug mb-4"
              style={{
                fontFamily: "Libre Caslon Text, serif",
                color: "#201A14",
                letterSpacing: "-0.02em",
              }}
            >
              Rasakan Kecocokannya,
              <br />
              <span style={{ color: "#6B4E2A" }}>Sebelum Membelinya.</span>
            </h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "#52432F" }}>
              Teknologi Virtual Try-On kami memungkinkan kamu melihat bagaimana karya pengrajin Nusantara terlihat di tubuhmu — akurat, privat, dan tanpa repot.
            </p>
            <button
              className="flex items-center gap-2.5 px-7 py-3 rounded-full text-sm font-semibold tracking-wide transition-all hover:bg-[#FFDDB8]"
              style={{ border: "1px solid #867462", color: "#261200" }}
            >
              <Sparkles className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.5} />
              Mulai Virtual Try-On
            </button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer
        className="mt-8"
        style={{
          borderTop: "1px solid #D5C3B0",
          backgroundColor: "#ECE1D8",
        }}
      >
        {/* Top footer */}
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-xs">
            <div
              className="text-2xl tracking-[0.2em] mb-3"
              style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}
            >
              BUSARI
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#52432F" }}>
              Platform fashion artisanal Indonesia yang menghubungkan pengrajin UMKM dengan pembeli yang menghargai warisan budaya.
            </p>
            {/* Motif strip */}
            <div className="mt-4 opacity-40" aria-hidden="true">
              <ParangDivider />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>
                Brand
              </p>
              {["Cerita Kami", "Pledge Keberlanjutan", "Artisan Impact"].map((l) => (
                <Link key={l} href="#" className="transition-colors hover:text-[#261200]" style={{ color: "#52432F" }}>
                  {l}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>
                Belanja
              </p>
              {["Semua Koleksi", "Batik", "Tenun", "Songket"].map((l) => (
                <Link key={l} href="#" className="transition-colors hover:text-[#261200]" style={{ color: "#52432F" }}>
                  {l}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>
                Bantuan
              </p>
              {["Pengiriman", "Pengembalian", "Ukuran"].map((l) => (
                <Link key={l} href="#" className="transition-colors hover:text-[#261200]" style={{ color: "#52432F" }}>
                  {l}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div
          className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: "1px solid #D5C3B0" }}
        >
          <p className="text-[11px]" style={{ color: "#867462" }}>
            © 2024 BUSARI Artisanal. Hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
