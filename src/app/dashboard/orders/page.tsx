import { Metadata } from "next"
import { getMyOrders } from "@/actions/orders"
import { formatPrice, formatDate } from "@/lib/utils"
import { ShoppingBag, Clock, CheckCircle2, XCircle, Package, MessageCircle, QrCode } from "lucide-react"

export const metadata: Metadata = {
  title: "Riwayat Pembelian — Busari",
  description: "Lihat riwayat semua pembelian kamu di Busari.",
}

const STATUS_CONFIG = {
  pending: { label: "Menunggu Konfirmasi", bg: "rgba(107,78,42,0.08)", color: "#6B4E2A", icon: Clock },
  paid: { label: "Pembayaran Diterima", bg: "rgba(92,96,41,0.08)", color: "#5C6029", icon: CheckCircle2 },
  completed: { label: "Selesai", bg: "rgba(92,96,41,0.12)", color: "#5C6029", icon: CheckCircle2 },
  failed: { label: "Gagal", bg: "rgba(186,26,26,0.08)", color: "#BA1A1A", icon: XCircle },
  expired: { label: "Kedaluwarsa", bg: "rgba(186,26,26,0.06)", color: "#BA1A1A", icon: XCircle },
  cancelled: { label: "Dibatalkan", bg: "rgba(186,26,26,0.06)", color: "#BA1A1A", icon: XCircle },
}

export default async function OrderHistoryPage() {
  const orders = await getMyOrders()

  return (
    <div className="min-h-screen pb-28" style={{ backgroundColor: "#FFF8F3", fontFamily: "Hanken Grotesk, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-5 md:px-10 py-8 md:py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#6B4E2A" }}>Akun Saya</p>
          <h1 className="text-3xl md:text-4xl font-normal" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.02em" }}>
            Riwayat Pembelian
          </h1>
          <p className="text-sm mt-1.5" style={{ color: "#867462" }}>
            {orders.length === 0 ? "Belum ada pembelian" : `${orders.length} order tercatat`}
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
            style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(107,78,42,0.06)" }}>
              <ShoppingBag className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
            </div>
            <p className="text-lg font-normal mb-2" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
              Belum ada pembelian
            </p>
            <p className="text-sm" style={{ color: "#867462" }}>
              Produk yang kamu beli akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusCfg = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              const isWA = order.payment_method === "whatsapp"

              return (
                <div key={order.id} className="rounded-2xl overflow-hidden"
                  style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>

                  {/* Order header */}
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: "1px solid rgba(107,78,42,0.08)" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: isWA ? "rgba(37,211,102,0.1)" : "rgba(107,78,42,0.08)" }}>
                        {isWA
                          ? <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} strokeWidth={2} />
                          : <QrCode className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={2} />
                        }
                      </div>
                      <div>
                        <p className="text-xs font-bold" style={{ color: "#201A14" }}>{order.order_code}</p>
                        <p className="text-[11px]" style={{ color: "#867462" }}>{formatDate(order.created_at)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: statusCfg.bg, color: statusCfg.color }}>
                        <StatusIcon className="w-2.5 h-2.5" strokeWidth={2.5} />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="px-5 py-4 space-y-3">
                    {(order.items as { name: string; price: number; quantity: number; product_id: string }[]).map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "#F3E0CC" }}>
                          <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{item.name}</p>
                          <p className="text-xs" style={{ color: "#867462" }}>
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0" style={{ color: "#6B4E2A" }}>
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3.5 flex items-center justify-between"
                    style={{ borderTop: "1px solid rgba(107,78,42,0.08)", background: "rgba(107,78,42,0.02)" }}>
                    <p className="text-xs" style={{ color: "#867462" }}>
                      {isWA ? "WhatsApp" : "QRIS · Midtrans"}
                      {order.paid_at && ` · Dibayar ${formatDate(order.paid_at)}`}
                      {order.completed_at && ` · Selesai ${formatDate(order.completed_at)}`}
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs" style={{ color: "#867462" }}>Total</p>
                      <p className="text-sm font-bold" style={{ color: "#6B4E2A" }}>
                        {formatPrice(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
