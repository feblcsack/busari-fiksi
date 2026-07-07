import { Metadata } from "next"
import { adminGetAllOrders } from "@/actions/orders"
import { AdminOrdersClient } from "@/components/admin/admin-orders-client"
import { formatPrice } from "@/lib/utils"
import { ShoppingBag, Clock, CheckCircle2, TrendingUp } from "lucide-react"

export const metadata: Metadata = {
  title: "Kelola Order — Admin Busari",
  description: "Kelola semua order dari buyer, konfirmasi WhatsApp order, dan pantau status pembayaran.",
}

export default async function AdminOrdersPage() {
  const orders = await adminGetAllOrders()

  const totalRevenue = orders
    .filter(o => o.status === "completed" || o.status === "paid")
    .reduce((sum, o) => sum + o.total_amount, 0)

  const stats = [
    { label: "Total Order", value: orders.length.toString(), icon: ShoppingBag, color: "#6B4E2A" },
    { label: "Menunggu", value: orders.filter(o => o.status === "pending").length.toString(), icon: Clock, color: "#7C5C40" },
    { label: "Selesai", value: orders.filter(o => o.status === "completed").length.toString(), icon: CheckCircle2, color: "#5C6029" },
    { label: "Total Pendapatan", value: formatPrice(totalRevenue), icon: TrendingUp, color: "#6B4E2A" },
  ]

  return (
    <div className="px-6 md:px-10 py-8 md:py-10" style={{ backgroundColor: "#FFF8F3", minHeight: "100vh" }}>
      <div className="mb-8">
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#6B4E2A" }}>Panel Admin</p>
        <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
          Kelola Order
        </h1>
        <p className="text-sm mt-1" style={{ color: "#867462" }}>
          {orders.length} total order · Konfirmasi WhatsApp order dan pantau pembayaran QRIS
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl p-4 flex flex-col gap-2"
            style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
              <Icon className="w-4 h-4" style={{ color }} strokeWidth={1.8} />
            </div>
            <p className="text-xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>{value}</p>
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#867462" }}>{label}</p>
          </div>
        ))}
      </div>

      <AdminOrdersClient orders={orders} />
    </div>
  )
}
