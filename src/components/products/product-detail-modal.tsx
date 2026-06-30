"use client"

import { useState, useEffect, useTransition } from "react"
import { X, Star, Package, Send, MessageCircle } from "lucide-react"
import { PublicProduct, ProductReview, getProductReviews, submitReview } from "../../actions/public-product"
import { formatPrice } from "@/lib/utils"

interface ProductDetailModalProps {
  product: PublicProduct | null
  onClose: () => void
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

export function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Ganti dengan nomor WhatsApp tujuan (gunakan format 62...)
  const WHATSAPP_NUMBER = "6281234567890" 

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

  const handleWhatsAppBuy = () => {
    if (!product) return
    const message = `Halo, saya tertarik dengan produk *${product.name}* seharga ${formatPrice(product.price)}. Apakah stoknya masih tersedia?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank")
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="absolute inset-0"
        style={{ background: "rgba(10, 8, 6, 0.85)", backdropFilter: "blur(8px)" }}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden rounded-t-3xl md:rounded-3xl mx-0 md:mx-4 bg-[#141210] border border-white/5 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
        >
          <X className="w-4 h-4 text-[#d2c5b0]" />
        </button>

        <div className="flex justify-center pt-3 pb-0 md:hidden">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Gambar disesuaikan dengan object-contain agar tidak terpotong */}
          <div className="relative w-full bg-[#1A1816] flex items-center justify-center p-4" style={{ height: "320px" }}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <Package className="w-16 h-16 text-[#4e4635]" />
            )}
          </div>

          <div className="px-6 py-6">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <h2 className="text-2xl leading-snug font-serif text-[#e8e1dd] mb-1">
                  {product.name}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-2">
                    <StarRating value={Math.round(avgRating)} readonly />
                    <span className="text-xs text-[#9b8f7c] font-sans">
                      {avgRating.toFixed(1)} · {reviews.length} ulasan
                    </span>
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xl font-bold text-[#F5C451] font-sans">
                  {formatPrice(product.price)}
                </p>
              </div>
            </div>

            {product.description && (
              <div className="mb-6">
                <p className="text-sm leading-relaxed text-[#d2c5b0] font-sans">
                  {product.description}
                </p>
              </div>
            )}

            {/* CTA WhatsApp Baru */}
            <button
              onClick={handleWhatsAppBuy}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 hover:brightness-110 active:scale-[0.98] mb-8 bg-[#25D366] text-white"
            >
              <MessageCircle className="w-5 h-5" />
              Beli via WhatsApp
            </button>

            <div className="h-px w-full mb-6 bg-white/5" />

            {/* Bagian Ulasan (Disederhanakan desainnya) */}
            <div>
              <p className="text-base font-semibold mb-4 font-serif text-[#e8e1dd]">
                Ulasan Pembeli
              </p>

              {submitSuccess ? (
                <div className="rounded-xl p-4 mb-4 text-sm text-center bg-[#F5C451]/10 text-[#F5C451] border border-[#F5C451]/20">
                  ✓ Ulasan berhasil dikirim. Terima kasih!
                </div>
              ) : (
                <div className="rounded-xl p-4 mb-6 bg-white/[0.02] border border-white/5">
                  <p className="text-xs font-semibold mb-3 uppercase tracking-wider text-[#9b8f7c]">
                    Tulis Ulasanmu
                  </p>
                  <div className="mb-3">
                    <StarRating value={rating} onChange={setRating} />
                  </div>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan pengalamanmu..."
                    rows={3}
                    className="w-full text-sm resize-none rounded-lg px-3 py-2.5 outline-none transition-colors bg-white/5 border border-white/10 text-[#e8e1dd] focus:border-[#F5C451]/50"
                  />
                  {submitError && (
                    <p className="text-xs mt-1.5 text-[#ffb4ab]">
                      {submitError}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={isPending || !comment.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-40 bg-[#F5C451]/10 text-[#F5C451] hover:bg-[#F5C451]/20"
                  >
                    <Send className="w-3 h-3" />
                    {isPending ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {loadingReviews ? (
                <div className="flex justify-center py-8">
                  <div className="w-5 h-5 rounded-full border-2 border-t-[#F5C451] border-[#4e4635] animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-center text-sm py-6 text-[#9b8f7c]">
                  Belum ada ulasan. Jadilah yang pertama!
                </p>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl p-4 bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-[#d2c5b0]">
                            {review.reviewer_name ?? "Pembeli Terverifikasi"}
                          </span>
                        </div>
                        <StarRating value={review.rating} readonly />
                      </div>
                      <p className="text-sm leading-relaxed text-[#9b8f7c]">
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