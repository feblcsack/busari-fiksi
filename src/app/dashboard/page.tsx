import Link from "next/link";
import { getProfile } from "@/actions/profile";
import { getProducts } from "@/actions/products";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Plus,
  ArrowRight,
  ShoppingBag,
  TrendingUp,
  User,
  Sparkles,
  ExternalLink,
  BarChart2,
} from "lucide-react";

// Sparkline chart — light mode colors
function PriceSparkline({ products }: { products: { price: number; created_at: string; name: string }[] }) {
  if (products.length < 2) return null;
  const sorted = [...products].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const prices = sorted.map((p) => p.price);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const range = maxP - minP || 1;
  const W = 400;
  const H = 90;
  const PAD = 8;
  const points = prices.map((p, i) => {
    const x = PAD + (i / (prices.length - 1)) * (W - PAD * 2);
    const y = PAD + (1 - (p - minP) / range) * (H - PAD * 2);
    return [x, y] as [number, number];
  });
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1][0]} ${H} L ${points[0][0]} ${H} Z`;
  return (
    <div className="relative w-full" style={{ height: H }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B4E2A" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#6B4E2A" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="#6B4E2A" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3" fill="#6B4E2A" opacity={i === points.length - 1 ? 1 : 0.4} />
        ))}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2">
        {sorted.slice(0, 1).map((p) => (
          <span key="first" className="text-[10px]" style={{ color: "#867462" }}>
            {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        ))}
        {sorted.slice(-1).map((p) => (
          <span key="last" className="text-[10px]" style={{ color: "#867462" }}>
            {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        ))}
      </div>
    </div>
  );
}

// Price distribution bar — light mode
function PriceDistribution({ products }: { products: { price: number }[] }) {
  if (products.length === 0) return null;
  const prices = products.map((p) => p.price);
  const max = Math.max(...prices);
  const min = Math.min(...prices);
  const bucketCount = 5;
  const bucketSize = (max - min) / bucketCount || 1;
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const lo = min + i * bucketSize;
    const hi = lo + bucketSize;
    const count = prices.filter((p) => p >= lo && (i === bucketCount - 1 ? p <= hi : p < hi)).length;
    return { lo, hi, count };
  });
  const maxCount = Math.max(...buckets.map((b) => b.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-16 w-full">
      {buckets.map((b, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${(b.count / maxCount) * 52}px`,
              background: b.count > 0
                ? `linear-gradient(to top, rgba(107,78,42,0.6), rgba(107,78,42,0.15))`
                : "rgba(107,78,42,0.06)",
              minHeight: "4px",
              border: b.count > 0 ? "1px solid rgba(107,78,42,0.25)" : "1px solid rgba(107,78,42,0.08)",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Tier donut — light mode
function TierRing({ products }: { products: { price: number }[] }) {
  if (products.length === 0) return null;
  const prices = products.map((p) => p.price);
  const sorted = [...prices].sort((a, b) => a - b);
  const p33 = sorted[Math.floor(sorted.length / 3)];
  const p66 = sorted[Math.floor((sorted.length * 2) / 3)];
  const budget = prices.filter((p) => p <= p33).length;
  const mid = prices.filter((p) => p > p33 && p <= p66).length;
  const premium = prices.filter((p) => p > p66).length;
  const total = prices.length;
  const segments = [
    { value: budget, color: "#D5C3B0", label: "Entry" },
    { value: mid, color: "#6B4E2A", label: "Mid" },
    { value: premium, color: "#7C5C40", label: "Premium" },
  ].filter((s) => s.value > 0);
  const r = 32; const cx = 40; const cy = 40;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(107,78,42,0.1)" strokeWidth="10" />
        {segments.map((seg, i) => {
          const dashArray = (seg.value / total) * circumference;
          const dashOffset = circumference - cumulative * circumference / total;
          cumulative += seg.value;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
              strokeWidth="10"
              strokeDasharray={`${dashArray} ${circumference - dashArray}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt" />
          );
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" fill="#201A14" fontSize="14" fontWeight="600">{total}</text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#867462" fontSize="8">produk</text>
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-xs" style={{ color: "#52432F" }}>
              {seg.label} <span style={{ color: "#201A14" }}>{seg.value} ({Math.round((seg.value / total) * 100)}%)</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const [profile, products] = await Promise.all([getProfile(), getProducts()]);
  const totalValue = products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = products.length > 0 ? Math.round(totalValue / products.length) : 0;
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0;
  const recentProducts = products.slice(0, 4);
  const healthScore = Math.min(100, Math.round(
    (Math.min(products.length, 20) / 20) * 50 +
    (products.filter((p) => p.image_url).length / Math.max(products.length, 1)) * 30 +
    (products.filter((p) => p.description).length / Math.max(products.length, 1)) * 20
  ));
  const firstName = profile?.full_name?.split(" ")[0] ?? "Partner";
  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Pagi" : hour < 15 ? "Siang" : hour < 18 ? "Sore" : "Malam";
  const featuredProduct = products[0] ?? null;

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-8 md:py-12">

        {/* ── Greeting ── */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#6B4E2A" }}>
              Selamat {greeting}
            </p>
            <h1 className="text-3xl md:text-5xl font-normal leading-tight" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
              {firstName}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#867462" }}>
              {products.length === 0 ? "Butikmu menunggu koleksi pertama." : `${products.length} produk tersimpan · Diperbarui baru saja`}
            </p>
          </div>
          {products.length > 0 && (
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl self-start sm:self-auto"
              style={{ background: "rgba(107,78,42,0.06)", border: "1px solid rgba(107,78,42,0.2)" }}>
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(107,78,42,0.15)" strokeWidth="4" />
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#6B4E2A" strokeWidth="4"
                    strokeDasharray={`${(healthScore / 100) * 100.5} 100.5`} strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color: "#6B4E2A" }}>
                  {healthScore}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: "#201A14" }}>Skor Butik</p>
                <p className="text-[10px]" style={{ color: "#867462" }}>
                  {healthScore >= 80 ? "Sangat Baik" : healthScore >= 50 ? "Perlu Ditingkatkan" : "Butuh Perhatian"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
          {[
            { label: "Total Koleksi", value: products.length.toString(), sub: "produk aktif", icon: Package, accent: "#6B4E2A" },
            { label: "Nilai Aset", value: products.length > 0 ? formatPrice(totalValue) : "—", sub: "total valuasi", icon: TrendingUp, accent: "#6B4E2A" },
            { label: "Rata-rata Harga", value: products.length > 0 ? formatPrice(avgPrice) : "—", sub: "per produk", icon: ShoppingBag, accent: "#6B4E2A" },
            { label: "Produk Termahal", value: products.length > 0 ? formatPrice(maxPrice) : "—", sub: "harga tertinggi", icon: Sparkles, accent: "#7C5C40" },
          ].map(({ label, value, sub, icon: Icon, accent }) => (
            <div key={label} className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden group"
              style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0", boxShadow: "0 2px 12px rgba(107,78,42,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `rgba(107,78,42,0.1)` }}>
                <Icon className="w-4 h-4" style={{ color: accent }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>{label}</p>
                <p className="text-xl md:text-2xl font-normal leading-tight" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{value}</p>
                <p className="text-[11px] mt-0.5" style={{ color: "#867462" }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Grid: Chart + Featured ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 rounded-2xl p-6"
            style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="flex items-center justify-between mb-1">
              <div>
                <p className="text-[11px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>Riwayat Harga</p>
                <p className="text-base mt-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>Tren Nilai Koleksi</p>
              </div>
              <BarChart2 className="w-4 h-4" style={{ color: "#D5C3B0" }} />
            </div>
            {products.length >= 2 ? (
              <div className="mt-4"><PriceSparkline products={products} /></div>
            ) : (
              <div className="mt-4 flex flex-col items-center justify-center py-8" style={{ color: "#D5C3B0" }}>
                <p className="text-sm text-center">Tambah minimal 2 produk untuk melihat tren harga.</p>
              </div>
            )}
            {products.length >= 2 && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid rgba(107,78,42,0.1)" }}>
                <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#867462" }}>Distribusi Harga</p>
                <PriceDistribution products={products} />
              </div>
            )}
          </div>

          {/* Featured Product */}
          <div className="rounded-2xl overflow-hidden flex flex-col"
            style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase px-5 pt-5 pb-3" style={{ color: "#867462" }}>Produk Terbaru</p>
            {featuredProduct ? (
              <>
                <div className="relative mx-4 rounded-xl overflow-hidden" style={{ aspectRatio: "4/3", backgroundColor: "#F3E0CC" }}>
                  {featuredProduct.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={featuredProduct.image_url} alt={featuredProduct.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} />
                    </div>
                  )}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(255,248,243,0.7) 0%, transparent 50%)" }} />
                  <span className="absolute bottom-3 left-3 text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full"
                    style={{ background: "#6B4E2A", color: "#FFFFFF" }}>UMKM</span>
                </div>
                <div className="px-5 py-4 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-base font-normal leading-snug" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{featuredProduct.name}</p>
                    {featuredProduct.description && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: "#867462" }}>{featuredProduct.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-lg font-semibold" style={{ fontFamily: "Libre Caslon Text, serif", color: "#6B4E2A" }}>
                      {formatPrice(featuredProduct.price)}
                    </span>
                    <Link href="/dashboard/products">
                      <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all"
                        style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}>
                        Edit <ExternalLink className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <Package className="w-8 h-8 mb-3" style={{ color: "#D5C3B0" }} />
                <p className="text-sm" style={{ color: "#867462" }}>Belum ada produk.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Price Tier + Recent Products ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-4" style={{ color: "#867462" }}>Segmentasi Produk</p>
            {products.length > 0 ? <TierRing products={products} /> : <p className="text-sm" style={{ color: "#D5C3B0" }}>Belum ada data.</p>}
            <div className="mt-5 pt-4 space-y-2.5" style={{ borderTop: "1px solid rgba(107,78,42,0.1)" }}>
              {(() => {
                const noImg = products.filter((p) => !p.image_url).length;
                const noDesc = products.filter((p) => !p.description).length;
                if (noImg === 0 && noDesc === 0 && products.length > 0) {
                  return <p className="text-xs" style={{ color: "#6B4E2A" }}>✓ Semua produk sudah lengkap!</p>;
                }
                return (
                  <>
                    {noImg > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#7C5C40" }} />
                        <p className="text-xs" style={{ color: "#867462" }}>{noImg} produk tanpa foto</p>
                      </div>
                    )}
                    {noDesc > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#6B4E2A" }} />
                        <p className="text-xs" style={{ color: "#867462" }}>{noDesc} produk tanpa deskripsi</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
              <p className="text-base font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>Koleksi Terbaru</p>
              <Link href="/dashboard/products">
                <button className="text-[11px] font-bold tracking-widest uppercase flex items-center gap-1.5" style={{ color: "#6B4E2A" }}>
                  Semua <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: "rgba(107,78,42,0.06)" }}>
                  <Package className="w-7 h-7" style={{ color: "#D5C3B0" }} />
                </div>
                <p className="text-base mb-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>Belum ada koleksi</p>
                <p className="text-xs mb-6" style={{ color: "#867462" }}>Mulai bangun etalase digitalmu sekarang.</p>
                <Link href="/dashboard/products">
                  <button className="px-6 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
                    style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}>
                    <Plus className="w-4 h-4" /> Tambah Koleksi
                  </button>
                </Link>
              </div>
            ) : (
              <div>
                {recentProducts.map((product, idx) => (
                  <div key={product.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-black/[0.02]"
                    style={{ borderBottom: idx < recentProducts.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                    <span className="text-xs font-semibold w-5 text-center shrink-0" style={{ color: "#D5C3B0" }}>{idx + 1}</span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F3E0CC" }}>
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5" style={{ color: "#D5C3B0" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate" style={{ color: "#201A14" }}>{product.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#867462" }}>
                        {product.description ? product.description.length > 40 ? product.description.slice(0, 40) + "…" : product.description : "Tanpa deskripsi"}
                      </p>
                    </div>
                    <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0">
                      <span className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</span>
                      <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "rgba(107,78,42,0.1)" }}>
                        <div className="h-full rounded-full" style={{ width: `${(product.price / maxPrice) * 100}%`, background: "linear-gradient(to right, #D5C3B0, #6B4E2A)" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/dashboard/products">
            <div className="group flex items-center gap-5 rounded-2xl p-6 cursor-pointer transition-all relative overflow-hidden" style={{ backgroundColor: "#6B4E2A" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
                <Plus className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 z-10">
                <p className="font-semibold text-sm mb-0.5 text-white">Tambah Koleksi Baru</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Unggah karya terbaikmu ke etalase.</p>
              </div>
              <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-1.5 z-10" />
            </div>
          </Link>
          <Link href="/dashboard/profile">
            <div className="group flex items-center gap-5 rounded-2xl p-6 cursor-pointer transition-all hover:border-[#6B4E2A]/30"
              style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(107,78,42,0.08)" }}>
                <User className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm mb-0.5" style={{ color: "#201A14" }}>Pengaturan Butik</p>
                <p className="text-xs" style={{ color: "#867462" }}>Perbarui profil dan informasi brand.</p>
              </div>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1.5" style={{ color: "#D5C3B0" }} />
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}
