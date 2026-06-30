"use client"

import { useEffect, useMemo, useState, useTransition, useCallback, useId } from "react"
import { X, Star, Package, Send, MessageCircle, BadgeCheck } from "lucide-react"
import { PublicProduct, ProductReview, getProductReviews, submitReview } from "../../actions/public-product"
import { formatPrice } from "@/lib/utils"

interface ProductDetailModalProps {
  product: PublicProduct | null
  onClose: () => void
}

// Nomor WhatsApp tujuan — disarankan dipindah ke NEXT_PUBLIC_WHATSAPP_NUMBER di .env
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "6281234567890"

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
  size?: "sm" | "md"
}) {
  const [hovered, setHovered] = useState(0)
  const dimension = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4"

  return (
    <div
      className="flex gap-0.5"
      role={readonly ? "img" : "radiogroup"}
      aria-label={readonly ? `Rating ${value} dari 5` : "Beri rating"}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const active = (hovered || value) >= star
        return (
          <button
            key={star}
            type="button"
            disabled={readonly}
            role={readonly ? undefined : "radio"}
            aria-checked={readonly ? undefined : value === star}
            aria-label={readonly ? undefined : `${star} bintang`}
            onClick={() => onChange?.(star)}
            onMouseEnter={() => !readonly && setHovered(star)}
            onMouseLeave={() => !readonly && setHovered(0)}
            className={
              readonly
                ? "cursor-default"
                : "cursor-pointer transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C451]/60 rounded-sm"
            }
          >
            <Star
              className={`${dimension} transition-colors duration-150`}
              fill={active ? "#F5C451" : "transparent"}
              stroke={active ? "#F5C451" : "#4e4635"}
              strokeWidth={1.5}
            />
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

  // Mengontrol animasi masuk/keluar tanpa dependency tambahan
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
    return () => {
      document.body.style.overflow = ""
      cancelAnimationFrame(raf)
    }
  }, [product])

  useEffect(() => {
    if (!product) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose()
    }
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
    return () => {
      cancelled = true
    }
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
    <div
      className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      {/* Scrim — Level 3 overlay, semi-transparent dark fill */}
      <div
        className={`absolute inset-0 bg-[#100e0c]/85 backdrop-blur-[20px] transition-opacity duration-200 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-2xl max-h-[92vh] md:max-h-[88vh] flex flex-col overflow-hidden rounded-t-xl md:rounded-xl mx-0 md:mx-4 bg-[#1d1b19] border border-white/[0.06] shadow-2xl transition-all duration-200 ease-out motion-reduce:transition-none ${
          isVisible && !isClosing
            ? "translate-y-0 opacity-100 md:scale-100"
            : "translate-y-6 opacity-0 md:translate-y-0 md:scale-[0.97]"
        }`}
      >
        <button
          onClick={handleClose}
          aria-label="Tutup"
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C451]/60"
        >
          <X className="w-4 h-4 text-[#d2c5b0]" />
        </button>

        <div className="flex justify-center pt-3 pb-0 md:hidden shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/10" />
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Gambar — transisi mulus ke konten lewat gradient, bukan garis tegas */}
          <div className="relative w-full bg-[#221f1d] flex items-center justify-center p-4" style={{ height: "320px" }}>
            {product.image_url && !imageFailed ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <Package className="w-16 h-16 text-[#4e4635]" aria-hidden="true" />
            )}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
              style={{ background: "linear-gradient(to bottom, transparent, #1d1b19)" }}
            />
          </div>

          <div className="px-6 pb-6 pt-1">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex-1 min-w-0">
                <h2 id={titleId} className="font-serif text-2xl leading-snug tracking-tight text-[#e8e1dd] mb-1.5">
                  {product.name}
                </h2>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2">
                    <StarRating value={Math.round(avgRating)} readonly size="sm" />
                    <span className="font-sans text-xs text-[#9b8f7c]">
                      {avgRating.toFixed(1)} · {reviews.length} ulasan
                    </span>
                  </div>
                )}
              </div>
              <p className="shrink-0 font-sans text-xl font-bold text-[#F5C451]">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.description && (
              <p className="font-sans text-[15px] leading-relaxed text-[#d2c5b0] mb-6">
                {product.description}
              </p>
            )}

            <button
              onClick={handleWhatsAppBuy}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded font-sans text-sm font-semibold tracking-wide text-white bg-[#25D366] transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/50 mb-8"
              style={{ boxShadow: "0 8px 24px -8px rgba(37, 211, 102, 0.35)" }}
            >
              <MessageCircle className="w-5 h-5" aria-hidden="true" />
              Beli via WhatsApp
            </button>

            <div className="h-px w-full bg-white/[0.06] mb-6" />

            {/* Ulasan */}
            <div>
              <p className="font-sans text-[18px] font-semibold text-[#e8e1dd] mb-4">
                Ulasan Pembeli
              </p>

              {submitSuccess ? (
                <div className="rounded-md p-4 mb-6 text-sm text-center font-sans text-[#F5C451] bg-[#F5C451]/10 border border-[#F5C451]/20">
                  Ulasan berhasil dikirim. Terima kasih sudah berbagi pengalaman.
                </div>
              ) : (
                <div className="rounded-md p-4 mb-6 bg-white/[0.02] border border-white/[0.06]">
                  <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#9b8f7c] mb-3">
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
                    aria-label="Tulis ulasanmu"
                    className="w-full resize-none rounded px-3 py-2.5 font-sans text-sm text-[#e8e1dd] bg-white/5 border border-white/10 outline-none transition-colors focus:border-[#F5C451]/50"
                  />
                  {submitError && (
                    <p className="mt-1.5 font-sans text-xs text-[#ffb4ab]" role="alert">
                      {submitError}
                    </p>
                  )}
                  <button
                    onClick={handleSubmitReview}
                    disabled={isPending || !comment.trim()}
                    className="mt-3 flex items-center gap-2 px-4 py-2 rounded font-sans text-xs font-semibold text-[#F5C451] bg-[#F5C451]/10 transition-all hover:bg-[#F5C451]/20 disabled:opacity-40 disabled:hover:bg-[#F5C451]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5C451]/40"
                  >
                    <Send className="w-3 h-3" aria-hidden="true" />
                    {isPending ? "Mengirim..." : "Kirim Ulasan"}
                  </button>
                </div>
              )}

              {loadingReviews ? (
                <div className="flex justify-center py-8" role="status" aria-label="Memuat ulasan">
                  <div className="w-5 h-5 rounded-full border-2 border-t-[#F5C451] border-[#4e4635] animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-center font-sans text-sm text-[#9b8f7c] py-6">
                  Belum ada ulasan. Jadilah yang pertama menulis.
                </p>
              ) : (
                <div className="flex flex-col gap-3 pb-2">
                  {reviews.map((review) => (
                    <div key={review.id} className="rounded-md p-4 bg-white/[0.02] border border-white/[0.06]">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        {review.reviewer_name ? (
                          <span className="font-sans text-xs font-medium text-[#d2c5b0]">
                            {review.reviewer_name}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-sans text-[11px] font-semibold tracking-wide text-[#6d5100] bg-[#F5C451]">
                            <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                            Pembeli Terverifikasi
                          </span>
                        )}
                        <StarRating value={review.rating} readonly size="sm" />
                      </div>
                      <p className="font-sans text-sm leading-relaxed text-[#9b8f7c]">
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