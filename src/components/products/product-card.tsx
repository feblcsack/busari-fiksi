"use client"

import { useState } from "react"
import { Pencil, Trash2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
      <Card className="group bg-[#141210] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-colors duration-300">
        {/* Product Image - Clean Minimalist Canvas */}
        <div className="aspect-square relative bg-[#1A1816] p-4 flex items-center justify-center">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url!}
              alt={product.name}
              className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <Package className="w-10 h-10 text-white/20" />
          )}

          {/* Minimalist Actions overlay */}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[#F5C451] hover:text-black transition-all"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-white hover:bg-[#ffb4ab] hover:text-black transition-all"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Product Info - Minimalist Text */}
        <div className="p-4">
          <h3 className="font-medium text-[#e8e1dd] text-sm leading-tight line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-3">
            <span className="text-[#F5C451] font-semibold text-sm">
              {formatPrice(product.price)}
            </span>
            <span className="text-[11px] text-[#9b8f7c]">
              {formatDate(product.created_at)}
            </span>
          </div>
        </div>
      </Card>

      {/* Delete confirmation dialog - Modern UI */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm bg-[#141210] border-white/10 text-[#e8e1dd] rounded-2xl p-6 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#ffb4ab] text-xl">Hapus produk?</DialogTitle>
            <DialogDescription className="text-[#9b8f7c] mt-2">
              <span className="text-[#e8e1dd]">&ldquo;{product.name}&rdquo;</span> akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(false)} 
              disabled={deleting}
              className="bg-transparent border-white/10 text-[#e8e1dd] hover:bg-white/5 rounded-xl"
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-[#93000a] text-[#ffdad6] hover:bg-[#ffb4ab] hover:text-[#690005] rounded-xl"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}