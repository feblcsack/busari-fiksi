import { adminGetStats, adminGetAllProducts, adminGetAllUsers } from "@/actions/admin"
import { formatPrice, formatDate } from "@/lib/utils"
import {
  Package, Users, Star, TrendingUp, AlertCircle,
  CheckCircle2, Clock, Activity, ArrowRight, XCircle
} from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const [stats, products, users] = await Promise.all([
    adminGetStats(),
    adminGetAllProducts(),
    adminGetAllUsers(),
  ])

  const pendingProducts = products.filter((p) => !p.status || p.status === "pending")
  const recentActivity = products
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6)

  // Per-seller pending counts
  const pendingBySeller = pendingProducts.reduce<Record<string, { name: string; count: number }>>((acc, p) => {
    const key = p.user_id
    if (!acc[key]) acc[key] = { name: p.seller_name ?? "Unknown", count: 0 }
    acc[key].count++
    return acc
  }, {})
  const topPendingSellers = Object.values(pendingBySeller)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)

  const reviewRate = stats.totalProducts > 0
    ? Math.round(((stats.approvedProducts + stats.rejectedProducts) / stats.totalProducts) * 100)
    : 0

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>
          Pantau aktivitas platform secara real-time.
        </p>
      </div>

      {/* ── Urgent banner (if pending reviews exist) ── */}
      {stats.pendingReviews > 0 && (
        <Link href="/admin/reviews">
          <div className="flex items-center gap-4 px-5 py-4 rounded-2xl mb-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{ background: "rgba(107,78,42,0.07)", border: "1px solid rgba(107,78,42,0.25)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 animate-pulse"
              style={{ background: "rgba(107,78,42,0.12)" }}>
              <Clock className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>
                {stats.pendingReviews} produk menunggu review
              </p>
              <p className="text-xs" style={{ color: "#867462" }}>
                Seller menunggu keputusan Anda. Klik untuk review sekarang.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "#6B4E2A" }} />
          </div>
        </Link>
      )}

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        {[
          { label: "Total Pengguna", value: users.length.toString(), icon: Users, color: "#6B4E2A", href: "/admin/users" },
          { label: "Total Produk", value: stats.totalProducts.toString(), icon: Package, color: "#6B4E2A", href: "/admin/products" },
          { label: "Menunggu Review", value: stats.pendingReviews.toString(), icon: Clock, color: "#7C5C40", href: "/admin/reviews" },
          { label: "Disetujui", value: stats.approvedProducts.toString(), icon: CheckCircle2, color: "#5C6029", href: "/admin/reviews" },
          { label: "Ditolak", value: stats.rejectedProducts.toString(), icon: XCircle, color: "#BA1A1A", href: "/admin/reviews" },
          { label: "Total Nilai", value: formatPrice(stats.totalValue), icon: TrendingUp, color: "#6B4E2A", href: "/admin/products" },
        ].map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <div className="rounded-2xl p-4 flex flex-col gap-2 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
              </div>
              <p className="text-xl font-normal leading-tight" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                {value}
              </p>
              <p className="text-[10px] font-semibold tracking-widest uppercase leading-tight" style={{ color: "#867462" }}>
                {label}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Pending review queue — full card */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,78,42,0.08)" }}>
                <Star className="w-3.5 h-3.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Antrian Review</p>
                <p className="text-xs" style={{ color: "#867462" }}>Produk yang perlu keputusan admin</p>
              </div>
              {stats.pendingReviews > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1"
                  style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                  {stats.pendingReviews}
                </span>
              )}
            </div>
            <Link href="/admin/reviews"
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase transition-opacity hover:opacity-70"
              style={{ color: "#6B4E2A" }}>
              Review Semua <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pendingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-8 h-8 mb-2" style={{ color: "#D5C3B0" }} />
              <p className="text-sm" style={{ color: "#867462" }}>Semua produk sudah direview — kerja bagus!</p>
            </div>
          ) : (
            <div>
              {pendingProducts.slice(0, 6).map((product, idx) => (
                <div key={product.id}
                  className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                  style={{ borderBottom: idx < Math.min(pendingProducts.length, 6) - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                  <div className="w-11 h-11 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: "#F3E0CC" }}>
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{product.name}</p>
                    <p className="text-xs truncate" style={{ color: "#867462" }}>
                      {product.seller_name ?? "Unknown"} · {formatDate(product.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold" style={{ color: "#6B4E2A" }}>
                      {formatPrice(product.price)}
                    </span>
                    <Link href="/admin/reviews">
                      <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-95"
                        style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                        Review
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
              {pendingProducts.length > 6 && (
                <div className="px-5 py-3 text-center" style={{ borderTop: "1px solid rgba(107,78,42,0.06)" }}>
                  <Link href="/admin/reviews" className="text-xs font-semibold" style={{ color: "#6B4E2A" }}>
                    +{pendingProducts.length - 6} produk lainnya menunggu →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — review rate + top sellers */}
        <div className="flex flex-col gap-4">
          {/* Review progress */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-4" style={{ color: "#867462" }}>
              Status Review
            </p>
            {/* Progress bar */}
            <div className="relative h-2 rounded-full overflow-hidden mb-3"
              style={{ background: "rgba(107,78,42,0.1)" }}>
              <div className="absolute inset-y-0 left-0 rounded-full transition-all"
                style={{
                  width: `${stats.totalProducts > 0 ? ((stats.approvedProducts) / stats.totalProducts) * 100 : 0}%`,
                  background: "#5C6029",
                }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Pending", value: stats.pendingReviews, color: "#6B4E2A" },
                { label: "Approved", value: stats.approvedProducts, color: "#5C6029" },
                { label: "Rejected", value: stats.rejectedProducts, color: "#BA1A1A" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <p className="text-lg font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color }}>
                    {value}
                  </p>
                  <p className="text-[10px] font-semibold tracking-wider uppercase mt-0.5" style={{ color: "#867462" }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
              <p className="text-[11px]" style={{ color: "#867462" }}>
                <span className="font-semibold text-sm" style={{ color: "#201A14" }}>{reviewRate}%</span>
                {" "}produk sudah direview
              </p>
            </div>
          </div>

          {/* Top sellers with pending */}
          {topPendingSellers.length > 0 && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#867462" }}>
                Seller Menunggu
              </p>
              <div className="space-y-2.5">
                {topPendingSellers.map(({ name, count }) => (
                  <div key={name} className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{name}</p>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                      {count} produk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform health */}
          <div className="rounded-2xl p-5" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#867462" }}>
              Sekilas Platform
            </p>
            <div className="space-y-3">
              {[
                { label: "Total Pengguna", value: stats.totalUsers, icon: Users },
                { label: "Penjual Aktif", value: new Set(products.map(p => p.user_id)).size, icon: Package },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: "#D5C3B0" }} strokeWidth={1.8} />
                    <p className="text-xs" style={{ color: "#52432F" }}>{label}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: "#201A14" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Aktivitas Terbaru</p>
          </div>
          <Link href="/admin/products"
            className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>
            Lihat Semua
          </Link>
        </div>
        <div>
          {recentActivity.map((product, idx) => (
            <div key={product.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
              style={{ borderBottom: idx < recentActivity.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
              <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                style={{ backgroundColor: "#F3E0CC" }}>
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{product.name}</p>
                <p className="text-xs" style={{ color: "#867462" }}>
                  {product.seller_name ?? "Unknown"} · {formatDate(product.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    background: product.status === "approved"
                      ? "rgba(92,96,41,0.1)"
                      : product.status === "rejected"
                        ? "rgba(186,26,26,0.08)"
                        : "rgba(107,78,42,0.08)",
                    color: product.status === "approved"
                      ? "#5C6029"
                      : product.status === "rejected"
                        ? "#BA1A1A"
                        : "#6B4E2A",
                    border: `1px solid ${product.status === "approved"
                      ? "rgba(92,96,41,0.2)"
                      : product.status === "rejected"
                        ? "rgba(186,26,26,0.15)"
                        : "rgba(107,78,42,0.2)"}`,
                  }}>
                  {product.status === "approved" ? "Disetujui" : product.status === "rejected" ? "Ditolak" : "Pending"}
                </span>
                <span className="text-xs font-semibold hidden sm:block" style={{ color: "#6B4E2A" }}>
                  {formatPrice(product.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick links ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {[
          { href: "/admin/products", label: "Kelola Produk", icon: Package, desc: `${stats.totalProducts} total produk` },
          { href: "/admin/reviews", label: "Review Produk", icon: Star, desc: `${stats.pendingReviews} menunggu review` },
          { href: "/admin/users", label: "Kelola Pengguna", icon: Users, desc: `${users.length} pengguna` },
          { href: "/admin/diagnostics", label: "Diagnostik", icon: AlertCircle, desc: "Kesehatan platform" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(107,78,42,0.08)" }}>
                <Icon className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#201A14" }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: "#867462" }}>{desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
