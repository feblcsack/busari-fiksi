"use client"

import Image from "next/image"
import Image from "next/image"
import { useState } from "react"
import { Pencil, Trash2, Package } from "lucide-react"
import { formatPrice, formatDate } from "@/lib/utils"
import { Product } from "@/types"
import { deleteProduct } from "@/actions/products"
import { showToast } from "@/components/ui/toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
}

export function ProductCard({ product, onEdit }: ProductCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [imgError, setImgError] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      showToast("Produk berhasil dihapus", "success")
      setDeleteOpen(false)
    } catch {
      showToast("Gagal menghapus produk", "error")
    } finally {
      setDeleting(false)
    }
  }

  const showImage = product.image_url && !imgError

  return (
    <>
      <div
        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", boxShadow: "0 2px 8px rgba(107,78,42,0.06)" }}
      >
        <div className="relative w-full flex items-center justify-center overflow-hidden"
          style={{ aspectRatio: "1/1", background: "#F3E0CC" }}>
          {showImage ? (
            <Image src={product.image_url!} alt={product.name} fill unoptimized
              className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              onError={() => setImgError(true)} />
          ) : (
            <Package className="w-10 h-10" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
          )}
          {/* Hover actions */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200"
            style={{ background: "rgba(255,248,243,0.7)", backdropFilter: "blur(3px)" }}>
            <button onClick={() => onEdit(product)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(107,78,42,0.1)", border: "1px solid rgba(107,78,42,0.25)", color: "#6B4E2A" }}
              aria-label="Edit produk">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setDeleteOpen(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", color: "#BA1A1A" }}
              aria-label="Hapus produk">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="px-4 py-3.5">
          <p className="text-[13px] font-medium leading-snug line-clamp-1 mb-1" style={{ color: "#201A14", fontFamily: "Hanken Grotesk, sans-serif" }}>
            {product.name}
          </p>
          {product.description && (
            <p className="text-[11px] leading-relaxed line-clamp-2 mb-3" style={{ color: "#867462", fontFamily: "Hanken Grotesk, sans-serif" }}>
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
            <span className="text-sm font-semibold" style={{ color: "#6B4E2A", fontFamily: "Hanken Grotesk, sans-serif" }}>
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px]" style={{ color: "#D5C3B0", fontFamily: "Hanken Grotesk, sans-serif" }}>
              {formatDate(product.created_at)}
            </span>
          </div>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm sm:rounded-2xl p-0 overflow-hidden border-0"
          style={{ background: "#FFF8F3", border: "1px solid #D5C3B0", boxShadow: "0 32px 80px rgba(107,78,42,0.15)" }}>
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="text-base mb-2"
                style={{ color: "#201A14", fontFamily: "Libre Caslon Text, serif", fontWeight: 400 }}>
                Hapus produk ini?
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed" style={{ color: "#867462", fontFamily: "Hanken Grotesk, sans-serif" }}>
                <span style={{ color: "#201A14" }}>&ldquo;{product.name}&rdquo;</span> akan dihapus permanen dan tidak bisa dikembalikan.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2.5 mt-6">
              <button onClick={() => setDeleteOpen(false)} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ background: "#FDF3EC", border: "1px solid #D5C3B0", color: "#867462", fontFamily: "Hanken Grotesk, sans-serif" }}>
                Batal
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(186,26,26,0.08)", border: "1px solid rgba(186,26,26,0.2)", color: "#BA1A1A", fontFamily: "Hanken Grotesk, sans-serif" }}>
                {deleting ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
