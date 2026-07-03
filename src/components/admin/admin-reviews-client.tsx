"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { adminReviewProduct } from "@/actions/admin"
import { showToast } from "@/components/ui/toast"
import { formatPrice, formatDate } from "@/lib/utils"
import {
  Package, CheckCircle2, XCircle, MessageSquare, Clock,
  Search, X, ChevronDown, ChevronUp, User
} from "lucide-react"

type ExtProduct = Product & { seller_name?: string | null; seller_email?: string | null }

interface AdminReviewsClientProps {
  pendingProducts: ExtProduct[]
  reviewedProducts: ExtProduct[]
}

function ReviewCard({ product, onReview, reviewingId }: {
  product: ExtProduct
  onReview: (id: string, status: "approved" | "rejected", note?: string) => void
  reviewingId: string | null
}) {
  const [expanded, setExpanded] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [showRejectInput, setShowRejectInput] = useState(false)

  const isPending = reviewingId === product.id
  const isReviewed = product.status === "approved" || product.status === "rejected"

  return (
    <div className="rounded-2xl overflow-hidden transition-all"
      style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
      {/* Image + status overlay */}
      <div className="relative" style={{ aspectRatio: "16/9", background: "#F3E0CC" }}>
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-10 h-10" style={{ color: "#D5C3B0" }} />
          </div>
        )}
        {/* Status chip */}
        <div className="absolute top-3 right-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              background: product.status === "approved"
                ? "rgba(92,96,41,0.9)"
                : product.status === "rejected"
                  ? "rgba(186,26,26,0.9)"
                  : "rgba(107,78,42,0.85)",
              color: "#FFFFFF",
              backdropFilter: "blur(4px)",
            }}>
            {product.status === "approved" ? "Disetujui" : product.status === "rejected" ? "Ditolak" : "Menunggu"}
          </span>
        </div>
        {/* Seller chip */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: "rgba(32,26,20,0.6)", color: "#FFFFFF", backdropFilter: "blur(4px)" }}>
            <User className="w-2.5 h-2.5" strokeWidth={2} />
            {product.seller_name ?? "Unknown"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-normal leading-snug"
            style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            {product.name}
          </h3>
          <span className="text-sm font-semibold shrink-0" style={{ color: "#6B4E2A" }}>
            {formatPrice(product.price)}
          </span>
        </div>

        {/* Collapsible description */}
        {product.description && (
          <div>
            <p className={`text-xs leading-relaxed ${expanded ? "" : "line-clamp-2"}`}
              style={{ color: "#867462" }}>
              {product.description}
            </p>
            {product.description.length > 100 && (
              <button onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-0.5 text-[11px] mt-1 transition-opacity hover:opacity-70"
                style={{ color: "#6B4E2A" }}>
                {expanded ? <><ChevronUp className="w-3 h-3" /> Sembunyikan</> : <><ChevronDown className="w-3 h-3" /> Selengkapnya</>}
              </button>
            )}
          </div>
        )}

        {/* Seller info */}
        <div className="mt-3 pt-3 flex items-center justify-between"
          style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
          <div>
            <p className="text-[11px] font-semibold" style={{ color: "#52432F" }}>
              {product.seller_name ?? "Unknown Seller"}
            </p>
            <p className="text-[11px]" style={{ color: "#867462" }}>
              {product.seller_email ?? ""}
            </p>
          </div>
          <p className="text-[11px]" style={{ color: "#D5C3B0" }}>{formatDate(product.created_at)}</p>
        </div>

        {/* Existing review note */}
        {product.review_note && (
          <div className="mt-3 flex gap-2 p-3 rounded-xl"
            style={{
              background: product.status === "rejected"
                ? "rgba(186,26,26,0.05)"
                : "rgba(107,78,42,0.05)",
              border: `1px solid ${product.status === "rejected" ? "rgba(186,26,26,0.12)" : "rgba(107,78,42,0.1)"}`,
            }}>
            <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5"
              style={{ color: product.status === "rejected" ? "#BA1A1A" : "#6B4E2A" }} strokeWidth={1.8} />
            <p className="text-xs leading-relaxed" style={{ color: "#52432F" }}>{product.review_note}</p>
          </div>
        )}

        {/* Action area */}
        {!isReviewed ? (
          <div className="mt-4 space-y-2">
            {/* Reject with note */}
            {showRejectInput ? (
              <div className="space-y-2">
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Alasan penolakan untuk penjual (wajib)..."
                  rows={2}
                  className="w-full text-xs rounded-xl px-3 py-2.5 outline-none resize-none transition-all"
                  style={{ background: "#FFF8F3", border: "1px solid rgba(186,26,26,0.3)", color: "#201A14" }}
                  onFocus={(e) => { e.target.style.borderColor = "#BA1A1A" }}
                  onBlur={(e) => { e.target.style.borderColor = "rgba(186,26,26,0.3)" }}
                  autoFocus />
                <div className="flex gap-2">
                  <button onClick={() => setShowRejectInput(false)} disabled={isPending}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
                    style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#867462" }}>
                    Batal
                  </button>
                  <button
                    onClick={() => onReview(product.id, "rejected", noteText.trim() || "Tidak memenuhi standar platform.")}
                    disabled={isPending}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    style={{ background: "#BA1A1A", color: "#FFFFFF" }}>
                    <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                    {isPending ? "Memproses..." : "Konfirmasi Tolak"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => onReview(product.id, "approved")}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 hover:brightness-95"
                  style={{ background: "rgba(92,96,41,0.12)", color: "#5C6029", border: "1px solid rgba(92,96,41,0.25)" }}>
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                  {isPending ? "Memproses..." : "Setujui"}
                </button>
                <button
                  onClick={() => setShowRejectInput(true)}
                  disabled={isPending}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                  style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.2)" }}>
                  <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  Tolak
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Already reviewed — show reset option */
          <div className="mt-4">
            <button
              onClick={() => onReview(product.id, "approved")}
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                background: product.status === "rejected"
                  ? "rgba(92,96,41,0.08)"
                  : "rgba(186,26,26,0.06)",
                color: product.status === "rejected" ? "#5C6029" : "#BA1A1A",
                border: `1px solid ${product.status === "rejected" ? "rgba(92,96,41,0.2)" : "rgba(186,26,26,0.15)"}`,
              }}>
              <Clock className="w-3.5 h-3.5" strokeWidth={2} />
              {product.status === "rejected" ? "Setujui Sekarang" : "Tarik Persetujuan"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function AdminReviewsClient({ pendingProducts, reviewedProducts }: AdminReviewsClientProps) {
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending")
  const [search, setSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleReview = (id: string, status: "approved" | "rejected", note?: string) => {
    if (reviewingId) return // jangan double-click
    setReviewingId(id)

    startTransition(async () => {
      try {
        await adminReviewProduct(id, status, note)
        showToast(
          status === "approved"
            ? "✓ Produk disetujui dan kini tampil di toko"
            : "Produk ditolak — catatan sudah dikirim ke seller",
          "success"
        )
        router.refresh()
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Gagal mengubah status"
        showToast(msg, "error")
      } finally {
        setReviewingId(null)
      }
    })
  }

  const allProducts = activeTab === "pending" ? pendingProducts : reviewedProducts
  const filtered = allProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.seller_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (p.seller_email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* ── Tabs + search row ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center mb-6">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          {([
            { key: "pending", label: "Menunggu", count: pendingProducts.length, urgent: pendingProducts.length > 0 },
            { key: "reviewed", label: "Sudah Direview", count: reviewedProducts.length, urgent: false },
          ] as const).map(({ key, label, count, urgent }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className="relative px-4 py-2 text-sm font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: activeTab === key ? "#6B4E2A" : "transparent",
                color: activeTab === key ? "#FFFFFF" : "#52432F",
              }}>
              {label}
              <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full font-bold"
                style={{
                  background: activeTab === key
                    ? "rgba(255,255,255,0.2)"
                    : urgent
                      ? "rgba(107,78,42,0.12)"
                      : "rgba(107,78,42,0.06)",
                  color: activeTab === key ? "#FFFFFF" : urgent ? "#6B4E2A" : "#867462",
                }}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "#867462" }} strokeWidth={1.8} />
          <input type="text" placeholder="Cari produk / penjual..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-xl outline-none transition-all"
            style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#201A14" }}
            onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
            onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5" style={{ color: "#867462" }} />
            </button>
          )}
        </div>

        {/* Loading indicator */}
        {isPending && (
          <div className="flex items-center gap-2 text-xs" style={{ color: "#6B4E2A" }}>
            <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin inline-block"
              style={{ borderTopColor: "#6B4E2A", borderColor: "#D5C3B0" }} />
            Memperbarui...
          </div>
        )}
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
          style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <CheckCircle2 className="w-10 h-10 mb-3" style={{ color: "#D5C3B0" }} />
          <p className="text-base" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            {search
              ? `Tidak ada hasil untuk "${search}"`
              : activeTab === "pending"
                ? "Tidak ada produk yang perlu direview — semua sudah beres!"
                : "Belum ada produk yang direview"}
          </p>
          {search && (
            <button onClick={() => setSearch("")} className="mt-3 text-sm" style={{ color: "#6B4E2A" }}>
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs mb-4" style={{ color: "#867462" }}>
            {filtered.length} produk{search ? ` untuk "${search}"` : ""}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((product) => (
              <ReviewCard
                key={product.id}
                product={product}
                onReview={handleReview}
                reviewingId={reviewingId}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
