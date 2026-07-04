"use client"

import { useEffect, useId, useState } from "react"
import Script from "next/script"
import { X, ShoppingCart, Trash2, Package, Minus, Plus, QrCode, Loader2 } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"
import { createMidtransOrder } from "@/actions/orders"
import { showToast } from "@/components/ui/toast"
import { ReceiptModal, ReceiptData } from "@/components/cart/receipt-modal"

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalItems, totalPrice, removeItem, updateQuantity, clearAllItems } = useCart()
  const titleId = useId()
  const [paying, setPaying] = useState(false)
  const [receipt, setReceipt] = useState<ReceiptData | null>(null)

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleWhatsappCheckout = () => {
    const itemList = items
      .map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price_at_addition * i.quantity)}`)
      .join("\n")
    const msg = `Halo, saya ingin memesan:\n\n${itemList}\n\nTotal: ${formatPrice(totalPrice)}\n\nMohon konfirmasi ketersediaan stok.`
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281932531119"
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer")
  }

  const handleMidtransCheckout = async () => {
    if (paying) return
    setPaying(true)

    const result = await createMidtransOrder(items)

    if (!result.success || !result.snapToken || !result.orderCode) {
      showToast(result.error ?? "Gagal memulai pembayaran", "error")
      setPaying(false)
      return
    }

    const snapshotItems = [...items]
    const snapshotTotal = totalPrice
    const orderCode = result.orderCode

    window.snap.pay(result.snapToken, {
      onSuccess: () => {
        setPaying(false)
        setReceipt({
          orderCode,
          items: snapshotItems,
          totalAmount: snapshotTotal,
          paymentMethod: "midtrans",
          createdAt: new Date().toISOString(),
        })
        clearAllItems()
        onClose()
      },
      onPending: () => {
        setPaying(false)
        showToast("Selesaikan pembayaran QRIS untuk melanjutkan", "success")
      },
      onError: () => {
        setPaying(false)
        showToast("Pembayaran gagal, silakan coba lagi", "error")
      },
      onClose: () => {
        setPaying(false)
      },
    })
  }

  if (!open) return null

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      <div className="fixed inset-0 z-[200] flex justify-end" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div
          className="absolute inset-0"
          style={{ background: "rgba(32,26,20,0.45)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        />

        <div
          className="relative flex flex-col w-full max-w-sm h-full shadow-2xl overflow-hidden"
          style={{ background: "#FFF8F3", borderLeft: "1px solid #D5C3B0", fontFamily: "Hanken Grotesk, sans-serif" }}
        >
          <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: "1px solid rgba(107,78,42,0.12)" }}>
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="w-5 h-5" style={{ color: "#6B4E2A" }} strokeWidth={1.8} />
              <h2 id={titleId} className="text-base font-semibold" style={{ color: "#201A14" }}>Keranjang</h2>
              {totalItems > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#6B4E2A", color: "#FFFFFF" }}>
                  {totalItems}
                </span>
              )}
            </div>
            <button onClick={onClose} aria-label="Tutup keranjang" className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5" style={{ color: "#52432F" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "rgba(107,78,42,0.06)" }}>
                  <ShoppingCart className="w-8 h-8" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-base font-normal mb-1" style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>Keranjang kosong</p>
                  <p className="text-sm" style={{ color: "#867462" }}>Tambah produk dari toko untuk mulai belanja.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.product_id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                    <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ background: "#F3E0CC" }}>
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-5 h-5" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#201A14" }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "#6B4E2A", fontWeight: 600 }}>{formatPrice(item.price_at_addition)}</p>
                      <div className="flex items-center gap-1.5 mt-2">
                        <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} aria-label="Kurang satu" className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5" style={{ border: "1px solid #D5C3B0", color: "#52432F" }}>
                          <Minus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center" style={{ color: "#201A14" }}>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} aria-label="Tambah satu" className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors hover:bg-black/5" style={{ border: "1px solid #D5C3B0", color: "#52432F" }}>
                          <Plus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <p className="text-sm font-semibold" style={{ color: "#6B4E2A" }}>{formatPrice(item.price_at_addition * item.quantity)}</p>
                      <button onClick={() => removeItem(item.product_id)} aria-label={`Hapus ${item.name}`} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-105" style={{ background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.2)" }}>
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="px-5 py-5 shrink-0 space-y-3" style={{ borderTop: "1px solid rgba(107,78,42,0.12)" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#867462" }}>{totalItems} item</span>
                <span className="font-semibold" style={{ color: "#201A14" }}>{formatPrice(totalPrice)}</span>
              </div>

              <button
                onClick={handleMidtransCheckout}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                style={{ background: "#6B4E2A" }}
              >
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" strokeWidth={2} />}
                {paying ? "Memproses..." : "Bayar dengan QRIS"}
              </button>

              <button
                onClick={handleWhatsappCheckout}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60"
                style={{ background: "#25D366" }}
              >
                Pesan via WhatsApp
              </button>

              <button onClick={clearAllItems} className="w-full text-center text-xs py-2 rounded-xl transition-all hover:bg-black/5" style={{ color: "#867462" }}>
                Kosongkan keranjang
              </button>
            </div>
          )}
        </div>
      </div>

      <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
    </>
  )
}