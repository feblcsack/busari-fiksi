import { adminGetStats, adminGetAllProducts } from "@/actions/admin"
import { formatPrice } from "@/lib/utils"
import { Package, Users, Star, TrendingUp, AlertCircle, CheckCircle2, Clock, Activity } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const [stats, products] = await Promise.all([adminGetStats(), adminGetAllProducts()])
  const recentProducts = products.slice(0, 8)
  const pendingProducts = products.filter((p) => !p.status || p.status === "pending").slice(0, 5)

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>

      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Overview
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>Pantau aktivitas platform secara keseluruhan.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4 mb-8">
        {[
          { label: "Total Pengguna", value: stats.totalUsers.toString(), icon: Users, color: "#6B4E2A" },
          { label: "Total Produk", value: stats.totalProducts.toString(), icon: Package, color: "#6B4E2A" },
          { label: "Perlu Review", value: stats.pendingReviews.toString(), icon: Clock, color: "#7C5C40" },
          { label: "Disetujui", value: stats.approvedProducts.toString(), icon: CheckCircle2, color: "#5C6029" },
          { label: "Ditolak", value: stats.rejectedProducts.toString(), icon: AlertCircle, color: "#BA1A1A" },
          { label: "Total Nilai", value: formatPrice(stats.totalValue), icon: TrendingUp, color: "#6B4E2A" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
            </div>
            <p className="text-xl font-normal leading-tight" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{value}</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase leading-tight" style={{ color: "#867462" }}>{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Pending Reviews */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Perlu Direview</p>
              {stats.pendingReviews > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                  {stats.pendingReviews}
                </span>
              )}
            </div>
            <Link href="/admin/reviews" className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>
              Lihat Semua
            </Link>
          </div>
          {pendingProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CheckCircle2 className="w-8 h-8 mb-2" style={{ color: "#D5C3B0" }} />
              <p className="text-sm" style={{ color: "#867462" }}>Semua produk sudah direview</p>
            </div>
          ) : (
            <div>
              {pendingProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                  style={{ borderBottom: idx < pendingProducts.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F3E0CC" }}>
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{product.name}</p>
                    <p className="text-xs truncate" style={{ color: "#867462" }}>{product.seller_name ?? "Unknown"}</p>
                  </div>
                  <Link href="/admin/reviews">
                    <button className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}>
                      Review
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Products */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Produk Terbaru</p>
            </div>
            <Link href="/admin/products" className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#6B4E2A" }}>
              Lihat Semua
            </Link>
          </div>
          <div>
            {recentProducts.map((product, idx) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-black/[0.02]"
                style={{ borderBottom: idx < recentProducts.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F3E0CC" }}>
                  {product.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{product.name}</p>
                  <p className="text-xs truncate" style={{ color: "#867462" }}>{product.seller_name ?? "Unknown"}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: product.status === "approved" ? "rgba(92,96,41,0.1)" : product.status === "rejected" ? "rgba(186,26,26,0.08)" : "rgba(107,78,42,0.08)",
                      color: product.status === "approved" ? "#5C6029" : product.status === "rejected" ? "#BA1A1A" : "#6B4E2A",
                      border: `1px solid ${product.status === "approved" ? "rgba(92,96,41,0.2)" : product.status === "rejected" ? "rgba(186,26,26,0.15)" : "rgba(107,78,42,0.2)"}`,
                    }}>
                    {product.status ?? "pending"}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/admin/products", label: "Kelola Produk", icon: Package, desc: "CRUD semua produk" },
          { href: "/admin/reviews", label: "Review Produk", icon: Star, desc: "Setujui atau tolak" },
          { href: "/admin/users", label: "Kelola Pengguna", icon: Users, desc: "Role & akses" },
          { href: "/admin/diagnostics", label: "Diagnostik", icon: Activity, desc: "Kesehatan platform" },
        ].map(({ href, label, icon: Icon, desc }) => (
          <Link key={href} href={href}>
            <div className="rounded-2xl p-5 flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(107,78,42,0.08)" }}>
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
