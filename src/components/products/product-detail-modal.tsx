"use client"

import { useState, useEffect, useTransition } from "react"
import { X, Star, Package, Send, MessageCircle } from "lucide-react"
import { PublicProduct, ProductReview, getProductReviews, submitReview } from "../../actions/public-product"
import { formatPrice } from "@/lib/utils"

interface ProductDetailModalProps {
  product: PublicProduct | null
  onClose: () => void
  /** Seller's WhatsApp number in international format, e.g. "6281234567890". */
  whatsappNumber?: string | null
}

function StarRating({
  value,
  onChange,
  readonly = false,
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className="w-4 h-4 transition-colors"
            fill={(hovered || value) >= star ? "#F5C451" : "transparent"}
            stroke={(hovered || value) >= star ? "#F5C451" : "#4e4635"}
            strokeWidth={1.5}
          />
        </button>
      ))}
    </div>
  )
}

export function ProductDetailModal({ product, onClose, whatsappNumber }: ProductDetailModalProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!product) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    setLoadingReviews(true)
    setSubmitSuccess(false)
    setComment("")
    setRating(5)
    setImgError(false)

    getProductReviews(product.id).then((data) => {
      setReviews(data)
      setLoadingReviews(false)
    })
  }, [product])

  if (!product) return null

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  function handleSubmitReview() {
    if (!product) return
    setSubmitError(null)
    startTransition(async () => {
      try {
        await submitReview(product.id, rating, comment)
        setSubmitSuccess(true)
        setComment("")
        setRating(5)
        const updated = await getProductReviews(product.id)
        setReviews(updated)
      } catch (err) {
        setSubmitError(err instanceof Error ? err.message : "Gagal mengirim review")
      }
    })
  }

  function handleWhatsApp() {
    if (!product) return
    const number = (whatsappNumber ?? "").replace(/\D/g, "")
    if (!number) return

    const message = `Halo, saya tertarik dengan produk "${product.name}" (${formatPrice(
      product.price
    )}) yang saya lihat di etalase Anda. Apakah masih tersedia?`

    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, "_blank")
  }

  const showImage = product.image_url && !imgError
  const hasWhatsApp = Boolean((whatsappNumber ?? "").replace(/\D/g, ""))

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10, 8, 6, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden rounded-t-3xl md:rounded-3xl mx-0 md:mx-4"
        style={{
          background: "#1d1b19",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 0.5px rgba(240,192,77,0.1)",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
          style={{ background: "rgba(255,255,255,0.08)" }}
          aria-label="Tutup"
        >
          <X className="w-4 h-4 text-[#9b8f7c]" />
        </button>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-0 md:hidden">
          <div className="w-10 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {/* Image — contained, never cropped, fits the canvas */}
          <div
            className="relative w-full flex items-center justify-center"
            style={{ aspectRatio: "1/1", maxHeight: "340px", background: "#100f0d" }}
          >
            {showImage ? (
              <img
                src={product.image_url!}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-14 h-14" style={{ color: "#332f29" }} strokeWidth={1.2} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <p
                  className="text-[10px] font-semibold tracking-[0.18em] uppercase mb-2"
                  style={{ color: "#F5C451", fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  UMKM Lokal
                </p>
                <h2
                  className="text-2xl leading-snug"
                  style={{
                    color: "#e8e1dd",
                    fontFamily: "Libre Caslon Text, serif",
                    fontWeight: 400,
                  }}
                >
                  {product.name}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={Math.round(avgRating)} readonly />
                    <span className="text-xs" style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}>
                      {avgRating.toFixed(1)} · {reviews.length} ulasan
                    </span>
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p
                  className="text-xl font-semibold"
                  style={{ color: "#F5C451", fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p
                className="text-sm leading-relaxed mb-6"
                style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                {product.description}
              </p>
            )}

            {/* CTA — WhatsApp */}
            <button
              onClick={handleWhatsApp}
              disabled={!hasWhatsApp}
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] mb-1 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#25D366",
                color: "#06210f",
                fontFamily: "Hanken Grotesk, sans-serif",
              }}
            >
              <MessageCircle className="w-4 h-4" />
              Pesan via WhatsApp
            </button>
            {!hasWhatsApp && (
              <p
                className="text-xs text-center mb-6"
                style={{ color: "#5a5248", fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Penjual belum menambahkan nomor WhatsApp.
              </p>
            )}
            {hasWhatsApp && (
              <p
                className="text-xs text-center mb-6"
                style={{ color: "#5a5248", fontFamily: "Hanken Grotesk, sans-serif" }}
              >
                Kamu akan diarahkan ke WhatsApp untuk bertanya atau memesan
              </p>
            )}

            {/* Divider */}
            <div className="h-px w-full mb-5" style={{ background: "rgba(78, 70, 53, 0.3)" }} />

            {/* Reviews Section */}
            <div>
              <p
                className="text-base font-semibold mb-4"
                style={{ color: "#e8e1dd", fontFamily: "Libre Caslon Text, serif" }}
              >
                Ulasan Pembeli
              </p>

              {/* Review form */}
              {submitSuccess ? (
                <div
                  className="rounded-xl p-4 mb-4 text-sm text-center"
                  style={{
                    background: "rgba(245, 196, 81, 0.1)",
                    border: "1px solid rgba(245, 196, 81, 0.25)",
                    color: "#F5C451",
                    fontFamily: "Hanken Grotesk, sans-serif",
                  }}
                >
                  ✓ Ulasan berhasil dikirim. Terima kasih!
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 mb-5"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    className="text-xs font-semibold mb-3 uppercase tracking-wider"
                    style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}
                  >
                    Tulis Ulasanmu
                  </p>
                  <div className="mb-3">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan pengalamanmu dengan produk ini..."
                    rows={3}
                    className="w-full text-sm resize-none rounded-lg px-3 py-2.5 outline-none transition-colors"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(78, 70, 53, 0.6)",
                      color: "#e8e1dd",
                      fontFamily: "Hanken Grotesk, sans-serif",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "rgba(245, 196, 81, 0.5)"
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(78, 70, 53, 0.6)"
                    }}
                  />
                  {submitError && (
                    <p className="text-xs mt-1.5" style={{ color: "#ffb4ab" }}>
                      {submitError}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={isPending || !comment.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                    style={{
                      background: "rgba(245, 196, 81, 0.15)",
                      color: "#F5C451",
                      border: "1px solid rgba(245, 196, 81, 0.25)",
                      fontFamily: "Hanken Grotesk, sans-serif",
                    }}
                  >
                    <Send className="w-3 h-3" />
                    {isPending ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {/* Review list */}
              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <div
                    className="w-5 h-5 rounded-full border-2 animate-spin"
                    style={{ borderColor: "#4e4635", borderTopColor: "#F5C451" }}
                  />
                </div>
              ) : reviews.length === 0 ? (
                <p
                  className="text-center text-sm py-6"
                  style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}
                >
                  Belum ada ulasan. Jadilah yang pertama!
                </p>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-xl p-4"
                      style={{
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: "rgba(245,196,81,0.15)", color: "#F5C451" }}
                          >
                            {(review.reviewer_name ?? "U")[0].toUpperCase()}
                          </div>
                          <span
                            className="text-xs font-medium"
                            style={{ color: "#d2c5b0", fontFamily: "Hanken Grotesk, sans-serif" }}
                          >
                            {review.reviewer_name ?? "Pembeli Terverifikasi"}
                          </span>
                        </div>
                        <StarRating value={review.rating} readonly />
                      </div>
                      <p
                        className="text-sm leading-relaxed"
                        style={{ color: "#9b8f7c", fontFamily: "Hanken Grotesk, sans-serif" }}
                      >
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}