"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product } from "@/types"
import { adminReviewProduct } from "@/actions/admin"
import { showToast } from "@/components/ui/toast"
import { formatPrice, formatDate } from "@/lib/utils"
import { Package, CheckCircle2, XCircle, MessageSquare, Clock } from "lucide-react"

type ExtProduct = Product & { seller_name?: string | null; seller_email?: string | null }

interface AdminReviewsClientProps {
  pendingProducts: ExtProduct[]
  reviewedProducts: ExtProduct[]
}

export function AdminReviewsClient({ pendingProducts, reviewedProducts }: AdminReviewsClientProps) {
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [noteModal, setNoteModal] = useState<{ product: ExtProduct; action: "approved" | "rejected" } | null>(null)
  const [noteText, setNoteText] = useState("")
  const [activeTab, setActiveTab] = useState<"pending" | "reviewed">("pending")

  const router = useRouter()

  const handleReview = async (id: string, status: "approved" | "rejected" | "pending", note?: string) => {
    setReviewingId(id)
    try {
      await adminReviewProduct(id, status, note)
      showToast(status === "approved" ? "Produk disetujui" : status === "rejected" ? "Produk ditolak" : "Status di-reset", "success")
      setNoteModal(null)
      setNoteText("")
      router.refresh()
    } catch {
      showToast("Gagal mengubah status", "error")
    } finally {
      setReviewingId(null)
    }
  }

  const openNoteModal = (product: ExtProduct, action: "approved" | "rejected") => {
    setNoteModal({ product, action })
    setNoteText("")
  }

  const displayProducts = activeTab === "pending" ? pendingProducts : reviewedProducts

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
        {([
          { key: "pending", label: `Pending (${pendingProducts.length})` },
          { key: "reviewed", label: `Reviewed (${reviewedProducts.length})` },
        ] as const).map(({ key, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
            style={{
              backgroundColor: activeTab === key ? "#6B4E2A" : "transparent",
              color: activeTab === key ? "#FFFFFF" : "#52432F",
            }}>
            {label}
          </button>
        ))}
      </div>

      {/* Product cards */}
      {displayProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
          <CheckCircle2 className="w-10 h-10 mb-3" style={{ color: "#D5C3B0" }} />
          <p className="text-base" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
            {activeTab === "pending" ? "Tidak ada produk yang perlu direview" : "Belum ada produk yang direview"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayProducts.map((product) => (
            <div key={product.id} className="rounded-2xl overflow-hidden" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
              {/* Image */}
              <div className="relative" style={{ aspectRatio: "16/9", background: "#F3E0CC" }}>
                {product.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8" style={{ color: "#D5C3B0" }} />
                  </div>
                )}
                {/* Status badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{
                      background: product.status === "approved" ? "rgba(92,96,41,0.9)" : product.status === "rejected" ? "rgba(186,26,26,0.9)" : "rgba(107,78,42,0.9)",
                      color: "#FFFFFF",
                    }}>
                    {product.status ?? "pending"}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-base font-normal leading-snug mb-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                  {product.name}
                </p>
                {product.description && (
                  <p className="text-xs mb-2 line-clamp-2" style={{ color: "#867462" }}>{product.description}</p>
                )}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</span>
                  <span className="text-[11px]" style={{ color: "#D5C3B0" }}>{formatDate(product.created_at)}</span>
                </div>
                <div className="pt-3 mb-3" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
                  <p className="text-[11px] font-semibold" style={{ color: "#52432F" }}>{product.seller_name ?? "Unknown Seller"}</p>
                  <p className="text-[11px]" style={{ color: "#867462" }}>{product.seller_email ?? ""}</p>
                </div>
                {product.review_note && (
                  <div className="flex gap-2 p-2.5 rounded-xl mb-3" style={{ background: "rgba(107,78,42,0.06)", border: "1px solid rgba(107,78,42,0.1)" }}>
                    <MessageSquare className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
                    <p className="text-xs leading-relaxed" style={{ color: "#52432F" }}>{product.review_note}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {product.status !== "approved" && (
                    <button onClick={() => openNoteModal(product, "approved")} disabled={reviewingId === product.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "rgba(92,96,41,0.1)", color: "#5C6029", border: "1px solid rgba(92,96,41,0.2)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} /> Setujui
                    </button>
                  )}
                  {product.status !== "rejected" && (
                    <button onClick={() => openNoteModal(product, "rejected")} disabled={reviewingId === product.id}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.15)" }}>
                      <XCircle className="w-3.5 h-3.5" strokeWidth={2} /> Tolak
                    </button>
                  )}
                  {product.status && product.status !== "pending" && (
                    <button onClick={() => handleReview(product.id, "pending")} disabled={reviewingId === product.id}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                      style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" }}>
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note modal */}
      {noteModal && (
        <>
          <div className="fixed inset-0 z-[80]" style={{ background: "rgba(32,26,20,0.4)", backdropFilter: "blur(8px)" }}
            onClick={() => setNoteModal(null)} />
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl overflow-hidden"
              style={{ background: "#FFF8F3", border: "1px solid #D5C3B0", boxShadow: "0 32px 80px rgba(107,78,42,0.15)" }}>
              <div className="px-6 py-5">
                <h3 className="text-base font-normal mb-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                  {noteModal.action === "approved" ? "Setujui Produk" : "Tolak Produk"}
                </h3>
                <p className="text-xs mb-4" style={{ color: "#867462" }}>
                  &ldquo;{noteModal.product.name}&rdquo;
                </p>
                <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Tambahkan catatan untuk penjual (opsional)..."
                  rows={3} className="w-full text-sm rounded-xl px-3.5 py-2.5 outline-none resize-none transition-all"
                  style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#201A14" }}
                  onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                  onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
                <div className="flex gap-2.5 mt-4">
                  <button onClick={() => setNoteModal(null)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                    style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#867462" }}>
                    Batal
                  </button>
                  <button
                    onClick={() => handleReview(noteModal.product.id, noteModal.action, noteText.trim() || undefined)}
                    disabled={reviewingId === noteModal.product.id}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                    style={{
                      background: noteModal.action === "approved" ? "rgba(92,96,41,1)" : "#BA1A1A",
                      color: "#FFFFFF",
                    }}>
                    {reviewingId === noteModal.product.id ? "Memproses..." : noteModal.action === "approved" ? "Setujui" : "Tolak"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
