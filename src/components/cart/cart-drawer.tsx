"use client"

import { useEffect, useId } from "react"
import { X, ShoppingCart, Trash2, Package, Minus, Plus } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearAllItems } = useCart()
  const titleId = useId()

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {/* Scrim */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(32,26,20,0.45)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="relative flex flex-col w-full max-w-sm h-full shadow-2xl overflow-hidden"
        style={{ background: "#FFF8F3", borderLeft: "1px solid #D5C3B0", fontFamily: "Hanken Grotesk, sans-serif" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(107,78,42,0.12)" }}
        >
          <div className="flex items-center gap-2.5">
            <ShoppingCart className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
            <h2 id={titleId} className="text-base font-semibold" style={{ color: "#201A14" }}>
              Keranjang
            </h2>
            {totalItems > 0 && (
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "#6B4E2A", color: "#FFFFFF" }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup keranjang"
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
            style={{ color: "#52432F" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(107,78,42,0.06)" }}
              >
                <ShoppingCart className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
              </div>
              <div>
                <p
                  className="text-base font-normal mb-1"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}
                >
                  Keranjang kosong
                </p>
                <p className="text-sm" style={{ color: "#867462" }}>
                  Tambah produk dari toko untuk mulai belanja.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product_id}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "#F3E0CC" }}
                  >
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>
                      {item.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6B4E2A", fontWeight: 600 }}>
                      {formatPrice(item.price_at_addition)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                        aria-label="Kurang satu"
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                        style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
                      >
                        <Minus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center" style={{ color: "#201A14" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                        aria-label="Tambah satu"
                        className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5"
                        style={{ border: "1px solid #D5C3B0", color: "#52432F" }}
                      >
                        <Plus className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal + remove */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <p className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>
                      {formatPrice(item.price_at_addition * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.product_id)}
                      aria-label={`Hapus ${item.name}`}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                      style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.2)" }}
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-5 shrink-0 space-y-4"
            style={{ borderTop: "1px solid rgba(107,78,42,0.12)" }}
          >
            {/* Summary */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#867462" }}>
                  {totalItems} item
                </span>
                <span className="font-semibold" style={{ color: "#201A14" }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* WhatsApp checkout CTA */}
            <button
              onClick={() => {
                const itemList = items
                  .map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price_at_addition * i.quantity)}`)
                  .join("\n")
                const msg = `Halo, saya ingin memesan:\n\n${itemList}\n\nTotal: ${formatPrice(totalPrice)}\n\nMohon konfirmasi ketersediaan stok.`
                const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890"
                window.open(
                  `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`,
                  "_blank",
                  "noopener,noreferrer"
                )
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ background: "#25D366" }}
            >
              Pesan via WhatsApp
            </button>

            <button
              onClick={clearAllItems}
              className="w-full text-center text-xs py-2 rounded-xl transition-all hover:bg-black/5"
              style={{ color: "#867462" }}
            >
              Kosongkan keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
