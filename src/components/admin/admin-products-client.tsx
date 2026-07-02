"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Product, Profile } from "@/types"
import { adminDeleteProduct, adminReviewProduct } from "@/actions/admin"
import { showToast } from "@/components/ui/toast"
import { formatPrice, formatDate } from "@/lib/utils"
import { Package, Search, X, Trash2, Pencil, CheckCircle2, XCircle, Clock, Plus } from "lucide-react"
import { AdminProductFormModal } from "./admin-product-form-modal"

type ExtProduct = Product & { seller_name?: string | null; seller_email?: string | null }

interface AdminProductsClientProps {
  products: ExtProduct[]
  users: Profile[]
}

export function AdminProductsClient({ products, users }: AdminProductsClientProps) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [editProduct, setEditProduct] = useState<ExtProduct | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [reviewingId, setReviewingId] = useState<string | null>(null)

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.seller_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.seller_email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "all" || (p.status ?? "pending") === filterStatus
    return matchSearch && matchStatus
  })

  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini secara permanen?")) return
    setDeletingId(id)
    try {
      await adminDeleteProduct(id)
      showToast("Produk berhasil dihapus", "success")
      router.refresh()
    } catch {
      showToast("Gagal menghapus produk", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleReview = async (id: string, status: "approved" | "rejected" | "pending") => {
    setReviewingId(id)
    try {
      await adminReviewProduct(id, status)
      showToast(`Produk ${status === "approved" ? "disetujui" : status === "rejected" ? "ditolak" : "di-reset"}`, "success")
      router.refresh()
    } catch {
      showToast("Gagal mengubah status", "error")
    } finally {
      setReviewingId(null)
    }
  }

  const statusBadge = (status: string | null | undefined) => {
    const s = status ?? "pending"
    const styles: Record<string, React.CSSProperties> = {
      approved: { background: "rgba(92,96,41,0.1)", color: "#5C6029", border: "1px solid rgba(92,96,41,0.2)" },
      rejected: { background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.15)" },
      pending: { background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" },
    }
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={styles[s] ?? styles.pending}>
        {s}
      </span>
    )
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#867462" }} strokeWidth={1.8} />
          <input type="text" placeholder="Cari produk atau penjual..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-sm rounded-xl outline-none transition-all"
            style={{ backgroundColor: "#FDF3EC", border: "1px solid #D5C3B0", color: "#201A14" }}
            onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
            onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5" style={{ color: "#867462" }} /></button>}
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-2 text-xs font-semibold rounded-xl transition-all capitalize"
              style={{
                backgroundColor: filterStatus === s ? "#6B4E2A" : "#FDF3EC",
                color: filterStatus === s ? "#FFFFFF" : "#52432F",
                border: `1px solid ${filterStatus === s ? "#6B4E2A" : "#D5C3B0"}`,
              }}>
              {s === "all" ? "Semua" : s}
            </button>
          ))}
          <button onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl ml-auto transition-all hover:brightness-95"
            style={{ backgroundColor: "#6B4E2A", color: "#FFFFFF" }}>
            <Plus className="w-4 h-4" strokeWidth={2.5} /> Tambah Produk
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs mb-4" style={{ color: "#867462" }}>{filtered.length} produk ditemukan</p>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #D5C3B0" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ fontFamily: "Hanken Grotesk, sans-serif" }}>
            <thead>
              <tr style={{ background: "#F3E0CC", borderBottom: "1px solid #D5C3B0" }}>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>Produk</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase hidden md:table-cell" style={{ color: "#867462" }}>Penjual</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>Harga</th>
                <th className="px-4 py-3 text-left text-[11px] font-bold tracking-widest uppercase hidden sm:table-cell" style={{ color: "#867462" }}>Status</th>
                <th className="px-4 py-3 text-right text-[11px] font-bold tracking-widest uppercase" style={{ color: "#867462" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center" style={{ color: "#867462" }}>
                    <Package className="w-8 h-8 mx-auto mb-2" style={{ color: "#D5C3B0" }} />
                    Tidak ada produk ditemukan
                  </td>
                </tr>
              ) : (
                filtered.map((product, idx) => (
                  <tr key={product.id} className="transition-colors hover:bg-black/[0.02]"
                    style={{ backgroundColor: idx % 2 === 0 ? "#FFF8F3" : "#FDF3EC", borderBottom: idx < filtered.length - 1 ? "1px solid rgba(107,78,42,0.06)" : "none" }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#F3E0CC" }}>
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          ) : <Package className="w-4 h-4" style={{ color: "#D5C3B0" }} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[160px]" style={{ color: "#201A14" }}>{product.name}</p>
                          <p className="text-[11px] mt-0.5" style={{ color: "#D5C3B0" }}>{formatDate(product.created_at)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="truncate max-w-[140px]" style={{ color: "#52432F" }}>{product.seller_name ?? "—"}</p>
                      <p className="text-[11px] truncate max-w-[140px] mt-0.5" style={{ color: "#867462" }}>{product.seller_email ?? "—"}</p>
                    </td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">{statusBadge(product.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve */}
                        {product.status !== "approved" && (
                          <button onClick={() => handleReview(product.id, "approved")} disabled={reviewingId === product.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: "rgba(92,96,41,0.1)", color: "#5C6029" }} title="Setujui">
                            <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        )}
                        {/* Reject */}
                        {product.status !== "rejected" && (
                          <button onClick={() => handleReview(product.id, "rejected")} disabled={reviewingId === product.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A" }} title="Tolak">
                            <XCircle className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        )}
                        {/* Reset to pending */}
                        {product.status && product.status !== "pending" && (
                          <button onClick={() => handleReview(product.id, "pending")} disabled={reviewingId === product.id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                            style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A" }} title="Reset ke pending">
                            <Clock className="w-3.5 h-3.5" strokeWidth={2} />
                          </button>
                        )}
                        {/* Edit */}
                        <button onClick={() => setEditProduct(product)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                          style={{ background: "rgba(107,78,42,0.08)", color: "#6B4E2A" }} title="Edit">
                          <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                        {/* Delete */}
                        <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}
                          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105 disabled:opacity-50"
                          style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A" }} title="Hapus">
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {addOpen && <AdminProductFormModal open={true} onClose={() => setAddOpen(false)} mode="create" users={users} />}
      {editProduct && <AdminProductFormModal open={true} onClose={() => setEditProduct(null)} mode="edit" product={editProduct} users={users} />}
    </div>
  )
}
