"use client"

import { useEffect, useMemo, useState, useTransition, useCallback, useId } from "react"
import { X, Star, Package, Send, MessageCircle, BadgeCheck } from "lucide-react"
import { PublicProduct, ProductReview, getProductReviews, submitReview } from "../../actions/public-product"
import { formatPrice } from "@/lib/utils"

interface ProductDetailModalProps {
  product: PublicProduct | null
  onClose: () => void
}

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890"

function StarRating({ value, onChange, readonly = false, size = "md" }:
  { value: number; onChange?: (v: number) => void; readonly?: boolean; size?: "sm" | "md" }) {
  const [hovered, setHovered] = useState(0)
  const dimension = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"
  return (
    <div className="flex gap-0.5" role={readonly ? "img" : "radiogroup"} aria-label={readonly ? `Rating ${value} dari 5` : "Beri rating"}>
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || value) >= star
        return (
          <button key={star} type="button" disabled={readonly}
            role={readonly ? undefined : "radio"}
            aria-checked={readonly ? undefined : value === star}
            aria-label={readonly ? undefined : `${star} bintang`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={readonly ? "cursor-default" : "cursor-pointer transition-transform duration-150 hover:scale-110 focus-visible:outline-none rounded-sm"}>
            <Star className={`${dimension} transition-colors duration-150`}
              fill={active ? "#6B4E2A" : "transparent"}
              stroke={active ? "#6B4E2A" : "#D5C3B0"}
              strokeWidth={1.5} />
          </button>
        )
      })}
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
  const [imageFailed, setImageFailed] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isVisible, setIsVisible] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const titleId = useId()

  const handleClose = useCallback(() => {
    setIsClosing(true)
    setIsVisible(false)
    window.setTimeout(onClose, 200)
  }, [onClose])

  useEffect(() => {
    if (!product) return
    document.body.style.overflow = "hidden"
    const raf = requestAnimationFrame(() => setIsVisible(true))
    return () => { document.body.style.overflow = ""; cancelAnimationFrame(raf) }
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose() }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [product, handleClose])

  useEffect(() => {
    if (!product) return
    setLoadingReviews(true)
    setSubmitSuccess(false)
    setSubmitError(null)
    setComment("")
    setRating(5)
    setImageFailed(false)
    setIsClosing(false)
    let cancelled = false
    getProductReviews(product.id).then((data) => {
      if (cancelled) return
      setReviews(data)
      setLoadingReviews(false)
    })
    return () => { cancelled = true }
  }, [product])

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }, [reviews])

  if (!product) return null

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
        setSubmitError(err instanceof Error ? err.message : "Gagal mengirim ulasan. Coba lagi.")
      }
    })
  }

  const handleWhatsAppBuy = () => {
    const message = `Halo, saya tertarik dengan produk *${product.name}* seharga ${formatPrice(product.price)}. Apakah stoknya masih tersedia?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      role="dialog" aria-modal="true" aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && handleClose()}>
      {/* Scrim */}
      <div className={`absolute inset-0 backdrop-blur-[12px] transition-opacity duration-200 ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ background: "rgba(32,26,20,0.45)" }}
        onClick={handleClose} />

      <div className={`relative w-full max-w-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden rounded-t-xl md:rounded-2xl mx-0 md:mx-4 shadow-xl transition-all duration-200 ease-out motion-reduce:transition-none ${
        isVisible && !isClosing ? "translate-y-0 opacity-100 md:scale-100" : "translate-y-6 opacity-0 md:translate-y-0 md:scale-[0.97]"
      }`}
        style={{ background: "#FFF8F3", border: "1px solid #D5C3B0" }}>

        <button onClick={handleClose} aria-label="Tutup"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none"
          style={{ background: "rgba(107,78,42,0.1)" }}>
          <X className="w-4 h-4" style={{ color: "#52432F" }} />
        </button>

        <div className="flex justify-center pt-3 pb-0 md:hidden shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: "#D5C3B0" }} />
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Image */}
          <div className="relative w-full flex items-center justify-center p-4" style={{ height: "280px", background: "#F3E0CC" }}>
            {product.image_url && !imageFailed ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-contain" onError={() => setImageFailed(true)} />
            ) : (
              <Package className="w-16 h-16" style={{ color: "#D5C3B0" }} aria-hidden="true" />
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10"
              style={{ background: "linear-gradient(to bottom, transparent, #FFF8F3)" }} />
          </div>

          <div className="px-6 pb-6 pt-2">
            {/* Title + Price */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="text-2xl leading-snug"
                  style={{ fontFamily: "Libre Caslon Text, serif", color: "#201A14", letterSpacing: "-0.01em" }}>
                  {product.name}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    <span className="text-xs" style={{ color: "#867462" }}>{avgRating.toFixed(1)} · {reviews.length} ulasan</span>
                  </div>
                )}
              </div>
              <p className="shrink-0 text-xl font-bold" style={{ color: "#6B4E2A" }}>{formatPrice(product.price)}</p>
            </div>

            {product.description && (
              <p className="text-[15px] leading-relaxed mb-5" style={{ color: "#52432F" }}>{product.description}</p>
            )}

            <button onClick={handleWhatsAppBuy}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold text-white bg-[#25D366] transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none mb-6">
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Beli via WhatsApp
            </button>

            <div className="h-px w-full mb-5" style={{ background: "#D5C3B0" }} />

            {/* Reviews */}
            <div>
              <p className="text-lg font-semibold mb-4" style={{ color: "#201A14" }}>Ulasan Pembeli</p>

              {submitSuccess ? (
                <div className="rounded-xl p-4 mb-5 text-sm text-center"
                  style={{ color: "#6B4E2A", background: "rgba(107,78,42,0.06)", border: "1px solid rgba(107,78,42,0.15)" }}>
                  Ulasan berhasil dikirim. Terima kasih sudah berbagi pengalaman.
                </div>
              ) : (
                <div className="rounded-xl p-4 mb-5" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "#867462" }}>Tulis Ulasanmu</p>
                  <div className="mb-3"><StarRating value={rating} onChange={setRating} /></div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="Ceritakan pengalamanmu..." rows={3} aria-label="Tulis ulasanmu"
                    className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{ background: "#FFF8F3", border: "1px solid #D5C3B0", color: "#201A14" }}
                    onFocus={(e) => { e.target.style.borderColor = "#6B4E2A" }}
                    onBlur={(e) => { e.target.style.borderColor = "#D5C3B0" }} />
                  {submitError && (
                    <p className="mt-1.5 text-xs" style={{ color: "#BA1A1A" }} role="alert">{submitError}</p>
                  )}
                  <button onClick={handleSubmitReview} disabled={isPending || !comment.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-40"
                    style={{ color: "#6B4E2A", background: "rgba(107,78,42,0.08)", border: "1px solid rgba(107,78,42,0.2)" }}>
                    <Send className="w-3 h-3" aria-hidden="true" />
                    {isPending ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {loadingReviews ? (
                <div className="flex justify-center py-8" role="status" aria-label="Memuat ulasan">
                  <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderTopColor: "#6B4E2A", borderColor: "#D5C3B0" }} />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-center text-sm py-6" style={{ color: "#867462" }}>
                  Belum ada ulasan. Jadilah yang pertama menulis.
                </p>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-xl p-4" style={{ background: "#FDF3EC", border: "1px solid #D5C3B0" }}>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {review.reviewer_name ? (
                          <span className="text-xs font-medium" style={{ color: "#52432F" }}>{review.reviewer_name}</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                            style={{ background: "rgba(107,78,42,0.1)", color: "#6B4E2A" }}>
                            <BadgeCheck className="w-3 h-3" aria-hidden="true" /> Pembeli Terverifikasi
                          </span>
                        )}
                        <StarRating value={review.rating} readonly size="sm" />
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "#52432F" }}>{review.comment}</p>
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
