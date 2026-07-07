"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Order } from "@/types"
import { adminCompleteOrder, adminCancelOrder } from "@/actions/orders"
import { showToast } from "@/components/ui/toast"
import { formatPrice, formatDate } from "@/lib/utils"
import {
  CheckCircle2, XCircle, Clock, Package, Search, X,
  MessageCircle, QrCode, ChevronDown, ChevronUp
} from "lucide-react"

type ExtOrder = Order & { buyer_name?: string | null; buyer_email?: string | null }

const STATUS_CONFIG = {
  pending: { label: "Menunggu", bg: "rgba(107,78,42,0.08)", color: "#6B4E2A", icon: Clock },
  paid: { label: "Dibayar", bg: "rgba(92,96,41,0.08)", color: "#5C6029", icon: CheckCircle2 },
  completed: { label: "Selesai", bg: "rgba(92,96,41,0.12)", color: "#5C6029", icon: CheckCircle2 },
  failed: { label: "Gagal", bg: "rgba(186,26,26,0.08)", color: "#BA1A1A", icon: XCircle },
  expired: { label: "Expired", bg: "rgba(186,26,26,0.06)", color: "#BA1A1A", icon: XCircle },
  cancelled: { label: "Dibatalkan", bg: "rgba(186,26,26,0.06)", color: "#BA1A1A", icon: XCircle },
}

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending
  const Icon = c.icon
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      <Icon className="w-2.5 h-2.5" strokeWidth={2.5} />
      {c.label}
    </span>
  )
}

function OrderRow({ order, onComplete, onCancel, processingId }: {
  order: ExtOrder
  onComplete: (id: string) => void
  onCancel: (id: string) => void
  processingId: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const isProcessing = processingId === order.id
  const canComplete = order.status === "pending" || order.status === "paid"
  const canCancel = order.status === "pending"
  const isWA = order.payment_method === "whatsapp"

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
      {/* Header row */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: isWA ? "rgba(37,211,102,0.1)" : "rgba(107,78,42,0.08)" }}>
          {isWA
            ? <MessageCircle className="w-4 h-4" style={{ color: "#25D366" }} strokeWidth={2} />
            : <QrCode className="w-4 h-4" style={{ color: "#6B4E2A" }} strokeWidth={2} />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold" style={{ color: "#201A14" }}>{order.order_code}</p>
            <StatusBadge status={order.status} />
            <span className="text-[11px] px-1.5 py-0.5 rounded"
              style={{ background: "rgba(107,78,42,0.06)", color: "#867462" }}>
              {isWA ? "WhatsApp" : "QRIS"}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: "#867462" }}>
            {order.buyer_name ?? order.customer_name ?? "Unknown"} · {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <p className="text-sm font-bold" style={{ color: "#6B4E2A" }}>{formatPrice(order.total_amount)}</p>
          <button onClick={() => setExpanded(!expanded)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-black/5"
            style={{ color: "#867462" }}>
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-5 pb-4" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
          {/* Items */}
          <div className="mt-3 space-y-1.5 mb-4">
            {(order.items as { name: string; price: number; quantity: number }[]).map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span style={{ color: "#52432F" }}>{item.name} <span style={{ color: "#867462" }}>x{item.quantity}</span></span>
                <span style={{ color: "#201A14" }}>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          {/* WA note */}
          {order.whatsapp_note && (
            <div className="mb-3 px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(37,211,102,0.06)", color: "#52432F", border: "1px solid rgba(37,211,102,0.15)" }}>
              <span style={{ color: "#25D366", fontWeight: 600 }}>Catatan: </span>{order.whatsapp_note}
            </div>
          )}

          {/* Buyer info */}
          <div className="mb-3 text-xs space-y-1">
            {order.buyer_email && <p style={{ color: "#867462" }}>Email: {order.buyer_email}</p>}
            {order.paid_at && <p style={{ color: "#5C6029" }}>Dibayar: {formatDate(order.paid_at)}</p>}
            {order.completed_at && <p style={{ color: "#5C6029" }}>Selesai: {formatDate(order.completed_at)}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {canComplete && (
              <button
                onClick={() => onComplete(order.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 hover:brightness-95"
                style={{ background: "#5C6029", color: "#FFFFFF" }}>
                <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                {isProcessing ? "Memproses..." : "Selesaikan Order"}
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => onCancel(order.id)}
                disabled={isProcessing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.2)" }}>
                <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Batalkan
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface AdminOrdersClientProps {
  orders: ExtOrder[]
}

export function AdminOrdersClient({ orders }: AdminOrdersClientProps) {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "completed" | "whatsapp">("all")
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_code.toLowerCase().includes(search.toLowerCase()) ||
      (o.buyer_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.buyer_email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === "all" ? true :
      filter === "whatsapp" ? o.payment_method === "whatsapp" :
      o.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    all: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    paid: orders.filter(o => o.status === "paid").length,
    completed: orders.filter(o => o.status === "completed").length,
    whatsapp: orders.filter(o => o.payment_method === "whatsapp").length,
  }

  const handleComplete = (id: string) => {
    setProcessingId(id)
    startTransition(async () => {
      const result = await adminCompleteOrder(id)
      if (result.success) {
        showToast("Order berhasil diselesaikan — stok sudah dikurangi", "success")
        router.refresh()
      } else {
        showToast(result.error ?? "Gagal", "error")
      }
      setProcessingId(null)
    })
  }

  const handleCancel = (id: string) => {
    setProcessingId(id)
    startTransition(async () => {
      const result = await adminCancelOrder(id)
      if (result.success) {
        showToast("Order dibatalkan", "success")
        router.refresh()
      } else {
        showToast(result.error ?? "Gagal", "error")
      }
      setProcessingId(null)
    })
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.entries(counts) as [string, number][]).map(([key, count]) => (
          <button key={key} onClick={() => setFilter(key as typeof filter)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
            style={{
              background: filter === key ? "#6B4E2A" : "rgba(107,78,42,0.06)",
              color: filter === key ? "#FFFFFF" : "#52432F",
              border: filter === key ? "none" : "1px solid #D5C3B0",
            }}>
            {key === "all" ? "Semua" :
             key === "pending" ? "Menunggu" :
             key === "paid" ? "Dibayar" :
             key === "completed" ? "Selesai" : "WhatsApp"} ({count})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#867462" }} />
        <input type="text" placeholder="Cari order / pembeli..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm rounded-xl outline-none"
          style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#201A14" }} />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-3.5 h-3.5" style={{ color: "#867462" }} />
          </button>
        )}
      </div>

      {/* Empty */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <Package className="w-10 h-10 mb-3" style={{ color: "#D5C3B0" }} />
          <p className="text-base" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            {search ? `Tidak ada hasil untuk "${search}"` : "Belum ada order"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs mb-2" style={{ color: "#867462" }}>{filtered.length} order</p>
          {filtered.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              onComplete={handleComplete}
              onCancel={handleCancel}
              processingId={processingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
