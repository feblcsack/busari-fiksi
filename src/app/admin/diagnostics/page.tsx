import { adminGetStats, adminGetAllProducts, adminGetAllUsers } from "@/actions/admin"
import { formatPrice } from "@/lib/utils"
import { Activity, AlertCircle, CheckCircle2, Package, Users, TrendingUp, Clock, Image as ImageIcon, FileText } from "lucide-react"

export default async function AdminDiagnosticsPage() {
  const [stats, products, users] = await Promise.all([adminGetStats(), adminGetAllProducts(), adminGetAllUsers()])

  const noImageProducts = products.filter((p) => !p.image_url)
  const noDescProducts = products.filter((p) => !p.description)
  const noNameProducts = products.filter((p) => !p.name || p.name.trim() === "")
  const zeroOrNegativePrice = products.filter((p) => p.price <= 0)
  const recentProducts = products.filter((p) => {
    const d = new Date(p.created_at)
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000
  })
  const avgPrice = products.length > 0 ? Math.round(products.reduce((sum, p) => sum + p.price, 0) / products.length) : 0
  const maxPrice = products.length > 0 ? Math.max(...products.map((p) => p.price)) : 0
  const minPrice = products.length > 0 ? Math.min(...products.map((p) => p.price)) : 0
  const completenessScore = products.length > 0
    ? Math.round((products.filter((p) => p.image_url && p.description && p.name && p.price > 0).length / products.length) * 100)
    : 100
  const adminCount = users.filter((u) => u.role === "admin").length
  const usersWithProducts = new Set(products.map((p) => p.user_id)).size

  const issues = [
    { label: "Produk tanpa foto", count: noImageProducts.length, severity: noImageProducts.length > 0 ? "warn" : "ok", icon: ImageIcon },
    { label: "Produk tanpa deskripsi", count: noDescProducts.length, severity: noDescProducts.length > 0 ? "warn" : "ok", icon: FileText },
    { label: "Produk tanpa nama", count: noNameProducts.length, severity: noNameProducts.length > 0 ? "error" : "ok", icon: AlertCircle },
    { label: "Produk harga ≤ 0", count: zeroOrNegativePrice.length, severity: zeroOrNegativePrice.length > 0 ? "error" : "ok", icon: AlertCircle },
    { label: "Produk pending review", count: stats.pendingReviews, severity: stats.pendingReviews > 10 ? "warn" : stats.pendingReviews > 0 ? "info" : "ok", icon: Clock },
  ]

  const severityStyles = {
    ok: { bg: "rgba(92,96,41,0.08)", color: "#5C6029", border: "rgba(92,96,41,0.2)" },
    info: { bg: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "rgba(107,78,42,0.2)" },
    warn: { bg: "rgba(124,92,64,0.1)", color: "#7C5C40", border: "rgba(124,92,64,0.25)" },
    error: { bg: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "rgba(186,26,26,0.2)" },
  }

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Diagnostik
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>Kesehatan platform dan deteksi masalah data.</p>
      </div>

      {/* Health Score */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Skor Kesehatan Platform</p>
            </div>
            <p className="text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: completenessScore >= 80 ? "#5C6029" : completenessScore >= 50 ? "#6B4E2A" : "#BA1A1A" }}>
              {completenessScore}%
            </p>
            <p className="text-xs mt-1" style={{ color: "#867462" }}>
              {completenessScore >= 80 ? "Sangat Baik — Mayoritas produk lengkap" : completenessScore >= 50 ? "Cukup Baik — Ada beberapa produk yang perlu dilengkapi" : "Perlu Perhatian — Banyak produk tidak lengkap"}
            </p>
          </div>
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
              <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(107,78,42,0.1)" strokeWidth="8" />
              <circle cx="40" cy="40" r="32" fill="none"
                stroke={completenessScore >= 80 ? "#5C6029" : completenessScore >= 50 ? "#6B4E2A" : "#BA1A1A"}
                strokeWidth="8"
                strokeDasharray={`${(completenessScore / 100) * 201} 201`}
                strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold"
              style={{ color: completenessScore >= 80 ? "#5C6029" : completenessScore >= 50 ? "#6B4E2A" : "#BA1A1A" }}>
              {completenessScore}%
            </span>
          </div>
        </div>
      </div>

      {/* Issues */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {issues.map(({ label, count, severity, icon: Icon }) => {
          const s = severityStyles[severity as keyof typeof severityStyles]
          return (
            <div key={label} className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${s.bg}`, border: `1px solid ${s.border}` }}>
                {count === 0 ? <CheckCircle2 className="w-4 h-4" style={{ color: s.color }} strokeWidth={2} />
                  : <Icon className="w-4 h-4" style={{ color: s.color }} strokeWidth={1.8} />}
              </div>
              <div>
                <p className="text-lg font-normal leading-tight" style={{ fontFamily: "Libre Caslon Text, serif", color: s.color }}>{count}</p>
                <p className="text-xs mt-0.5" style={{ color: s.color, opacity: 0.8 }}>{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Pengguna", value: stats.totalUsers, icon: Users },
          { label: "Total Produk", value: stats.totalProducts, icon: Package },
          { label: "Penjual Aktif", value: usersWithProducts, icon: Users },
          { label: "Admin", value: adminCount, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: "rgba(107,78,42,0.08)" }}>
              <Icon className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            </div>
            <p className="text-2xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{value}</p>
            <p className="text-[11px] font-semibold tracking-widest uppercase mt-0.5" style={{ color: "#867462" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Price analysis */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
          <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Analisis Harga</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Nilai", value: formatPrice(stats.totalValue) },
            { label: "Rata-rata Harga", value: formatPrice(avgPrice) },
            { label: "Harga Tertinggi", value: formatPrice(maxPrice) },
            { label: "Harga Terendah", value: formatPrice(minPrice) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>{label}</p>
              <p className="text-base font-semibold" style={{ color: "#6B4E2A" }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="rounded-2xl p-6" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
          <p className="text-sm font-semibold" style={{ color: "#201A14" }}>Aktivitas 7 Hari Terakhir</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>Produk Baru</p>
            <p className="text-2xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{recentProducts.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#867462" }}>Persentase</p>
            <p className="text-2xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              {products.length > 0 ? Math.round((recentProducts.length / products.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
