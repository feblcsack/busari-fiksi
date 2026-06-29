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
      <Card className="overflow-hidden group hover:shadow-lg hover:shadow-[#F5C451]/5 transition-all duration-300 bg-[#2A2621] border-[#4e4635] rounded-[16px] font-sans">
        {/* Product Image */}
        <div className="aspect-square relative bg-[#151311]">
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url!}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-12 h-12 text-[#4e4635]" />
            </div>
          )}
          
          {/* Subtle gradient overlay for better contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#151311]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Actions overlay */}
          <div className="absolute inset-0 bg-[#151311]/20 group-hover:bg-[#151311]/40 transition-colors duration-300" />
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-[8px] bg-[#151311]/70 backdrop-blur-md border border-white/10 text-[#F5C451] hover:bg-[#F5C451] hover:text-[#12100E] hover:border-[#F5C451] transition-all"
              onClick={() => onEdit(product)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-9 w-9 rounded-[8px] bg-[#151311]/70 backdrop-blur-md border border-white/10 text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-[#690005] hover:border-[#ffb4ab] transition-all"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-[#e8e1dd] text-sm leading-tight line-clamp-1">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-[#d2c5b0] mt-1.5 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#4e4635]/50">
            <span className="text-[#F5C451] font-semibold text-sm tracking-wide">
              {formatPrice(product.price)}
            </span>
            <span className="text-xs text-[#9b8f7c]">
              {formatDate(product.created_at)}
            </span>
          </div>
        </div>
      </Card>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm bg-[#2A2621] border-[#4e4635] text-[#e8e1dd] sm:rounded-[16px] p-6 font-sans shadow-2xl shadow-black/50">
          <DialogHeader>
            <DialogTitle className="font-serif text-[#ffb4ab] text-xl">Hapus produk?</DialogTitle>
            <DialogDescription className="text-[#d2c5b0] mt-2">
              <span className="font-semibold text-[#e8e1dd]">&ldquo;{product.name}&rdquo;</span> akan dihapus secara permanen dan tidak bisa dikembalikan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setDeleteOpen(false)} 
              disabled={deleting}
              className="bg-transparent border-[#4e4635] text-[#e8e1dd] hover:bg-[#373432] hover:text-white rounded-[8px]"
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-[#93000a] text-[#ffdad6] hover:bg-[#ffb4ab] hover:text-[#690005] rounded-[8px] font-semibold"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}