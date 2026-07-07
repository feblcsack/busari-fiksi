"use client"

import { useEffect, useId, useState, useRef } from "react"
import Script from "next/script"
import {
  X, ShoppingCart, Trash2, Package, Minus, Plus,
  QrCode, Loader2, MessageCircle, ShoppingBag, ArrowRight,
} from "lucide-react"
import { useCart } from "@/context/cart-context"
import { formatPrice } from "@/lib/utils"
import { createMidtransOrder, createWhatsappOrder } from "@/actions/orders"
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
  const [visible, setVisible] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Animate in/out
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
      requestAnimationFrame(() => setVisible(true))
    } else {
      setVisible(false)
      const t = setTimeout(() => {
        document.body.style.overflow = ""
      }, 300)
      return () => clearTimeout(t)
    }
    return () => { document.body.style.overflow = "" }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [onClose])

  const handleRemove = (productId: string, name: string) => {
    setRemovingId(productId)
    setTimeout(() => {
      removeItem(productId)
      setRemovingId(null)
    }, 200)
    void name
  }

  const handleWhatsappCheckout = async () => {
    // Create WA order record in DB first (status: pending, admin will complete)
    const result = await createWhatsappOrder(items)

    const itemList = items
      .map((i) => `• ${i.name} x${i.quantity} — ${formatPrice(i.price_at_addition * i.quantity)}`)
      .join("\n")
    const orderRef = result.success && result.orderCode ? `\n\nNo. Order: *${result.orderCode}*` : ""
    const msg = `Halo, saya ingin memesan:\n\n${itemList}\n\nTotal: ${formatPrice(totalPrice)}${orderRef}\n\nMohon konfirmasi ketersediaan stok.`
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281932531119"
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer")

    if (result.success) {
      showToast("Order WhatsApp berhasil dibuat! Admin akan mengkonfirmasi.", "success")
    }
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
      onClose: () => { setPaying(false) },
    })
  }

  if (!open && !visible) return null

  const isEmpty = items.length === 0

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />

      {/* Overlay */}
      <div
        className="fixed inset-0 z-[200] flex justify-end"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Scrim */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "rgba(32,26,20,0.5)",
            backdropFilter: "blur(6px)",
            opacity: visible ? 1 : 0,
          }}
          onClick={onClose}
        />

        {/* Panel */}
        <div
          ref={panelRef}
          className="relative flex flex-col h-full transition-transform duration-300 ease-out"
          style={{
            width: "min(420px, 100vw)",
            background: "#FFF8F3",
            borderLeft: "1px solid #D5C3B0",
            fontFamily: "Hanken Grotesk, sans-serif",
            boxShadow: "-16px 0 48px rgba(107,78,42,0.12)",
            transform: visible ? "translateX(0)" : "translateX(100%)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-6 py-4 shrink-0"
            style={{ borderBottom: "1px solid rgba(107,78,42,0.1)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(107,78,42,0.08)" }}
              >
                <ShoppingCart className="w-4.5 h-4.5" style={{ color: "#6B4E2A" }} strokeWidth={2} />
              </div>
              <div>
                <h2 id={titleId} className="text-[15px] font-semibold leading-tight" style={{ color: "#201A14" }}>
                  Keranjang Belanja
                </h2>
                <p className="text-[11px]" style={{ color: "#867462" }}>
                  {totalItems === 0 ? "Kosong" : `${totalItems} item dipilih`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup keranjang"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/5 active:scale-95"
              style={{ color: "#52432F" }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">
            {isEmpty ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 px-8 py-16">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(107,78,42,0.06)", border: "1px dashed #D5C3B0" }}
                >
                  <ShoppingBag className="w-9 h-9" style={{ color: "#D5C3B0" }} strokeWidth={1.2} />
                </div>
                <div>
                  <p className="text-lg font-normal mb-1.5"
                    style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14" }}>
                    Keranjang masih kosong
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: "#867462" }}>
                    Temukan produk UMKM lokal yang kamu suka dan tambahkan ke sini.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95 active:scale-[0.98]"
                  style={{ background: "#6B4E2A", color: "#FFFFFF" }}
                >
                  Lihat Produk <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-start gap-3 p-3.5 rounded-2xl transition-all duration-200"
                    style={{
                      background: "#FDF3EC",
                      border: "1px solid #D5C3B0",
                      opacity: removingId === item.product_id ? 0 : 1,
                      transform: removingId === item.product_id ? "scale(0.97) translateX(8px)" : "none",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      className="w-16 h-16 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: "#F3E0CC" }}
                    >
                      {item.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <Package className="w-6 h-6" style={{ color: "#D5C3B0" }} strokeWidth={1.5} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug truncate mb-0.5" style={{ color: "#201A14" }}>
                        {item.name}
                      </p>
                      <p className="text-xs mb-2.5" style={{ color: "#867462" }}>
                        {formatPrice(item.price_at_addition)} / pcs
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-0">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          aria-label="Kurang satu"
                          className="w-7 h-7 rounded-l-lg flex items-center justify-center transition-all hover:bg-black/5 active:scale-95"
                          style={{ border: "1px solid #D5C3B0", borderRight: "none", color: "#52432F" }}
                        >
                          <Minus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                        <div
                          className="w-8 h-7 flex items-center justify-center text-sm font-semibold"
                          style={{ border: "1px solid #D5C3B0", color: "#201A14", background: "#FFF8F3" }}
                        >
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          aria-label="Tambah satu"
                          className="w-7 h-7 rounded-r-lg flex items-center justify-center transition-all hover:bg-black/5 active:scale-95"
                          style={{ border: "1px solid #D5C3B0", borderLeft: "none", color: "#52432F" }}
                        >
                          <Plus className="w-3 h-3" strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>

                    {/* Right: price + delete */}
                    <div className="flex flex-col items-end justify-between h-full gap-3 shrink-0 self-stretch">
                      <button
                        onClick={() => handleRemove(item.product_id, item.name)}
                        aria-label={`Hapus ${item.name}`}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ background: "rgba(186,26,26,0.07)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.15)" }}
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.8} />
                      </button>
                      <p className="text-sm font-bold" style={{ color: "#6B4E2A" }}>
                        {formatPrice(item.price_at_addition * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {!isEmpty && (
            <div
              className="px-5 pb-6 pt-4 shrink-0"
              style={{ borderTop: "1px solid rgba(107,78,42,0.1)" }}
            >
              {/* Order summary */}
              <div
                className="rounded-2xl p-4 mb-4"
                style={{ background: "rgba(107,78,42,0.04)", border: "1px solid rgba(107,78,42,0.1)" }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs" style={{ color: "#867462" }}>
                    Subtotal ({totalItems} item)
                  </span>
                  <span className="text-sm font-semibold" style={{ color: "#201A14" }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: "1px solid rgba(107,78,42,0.08)" }}>
                  <span className="text-sm font-semibold" style={{ color: "#201A14" }}>Total</span>
                  <span className="text-lg font-bold" style={{ color: "#6B4E2A", fontFamily: "Libre Caslon Text, serif" }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              {/* QRIS / Midtrans */}
              <button
                onClick={handleMidtransCheckout}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 mb-3"
                style={{ background: "#6B4E2A", color: "#FFFFFF" }}
              >
                {paying
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <QrCode className="w-4 h-4" strokeWidth={2} />
                }
                {paying ? "Memproses pembayaran..." : "Bayar dengan QRIS"}
              </button>

              {/* WhatsApp */}
              <button
                onClick={handleWhatsappCheckout}
                disabled={paying}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-60 mb-3"
                style={{ background: "#25D366", color: "#FFFFFF" }}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                Pesan via WhatsApp
              </button>

              {/* Clear all */}
              <button
                onClick={clearAllItems}
                disabled={paying}
                className="w-full text-center text-xs py-2 rounded-xl transition-all hover:bg-black/[0.04] disabled:opacity-40"
                style={{ color: "#D5C3B0" }}
              >
                Hapus semua item
              </button>
            </div>
          )}
        </div>
      </div>

      <ReceiptModal data={receipt} onClose={() => setReceipt(null)} />
    </>
  )
}
