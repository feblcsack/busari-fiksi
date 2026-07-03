"use client"

import { useState } from "react"
import { ShoppingCart, Check, AlertCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { PublicProduct } from "@/actions/public-product"

interface AddToCartButtonProps {
  product: PublicProduct
  className?: string
}

type ButtonState = "idle" | "loading" | "success" | "error"

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [state, setState] = useState<ButtonState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const stock = product.stock
  const isApproved = product.status === "approved" || product.status == null
  const hasStock = stock === null || stock === undefined || stock > 0
  const isDisabled = !isApproved || !hasStock || state === "loading"

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // jangan buka product detail modal
    if (state === "loading" || isDisabled) return

    setState("loading")
    setErrorMsg(null)

    try {
      const result = await addItem(product.id, {
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        stock,
      })

      if (result.success) {
        setState("success")
        setTimeout(() => setState("idle"), 1800)
      } else {
        setState("error")
        setErrorMsg(result.error ?? "Gagal menambahkan")
        setTimeout(() => { setState("idle"); setErrorMsg(null) }, 2500)
      }
    } catch {
      setState("error")
      setErrorMsg("Terjadi kesalahan, coba lagi")
      setTimeout(() => { setState("idle"); setErrorMsg(null) }, 2500)
    }
  }

  // Tentukan tampilan berdasarkan state
  const isIdle = state === "idle"
  const isLoading = state === "loading"
  const isSuccess = state === "success"
  const isError = state === "error"

  let bgColor = "rgba(107,78,42,0.1)"
  let textColor = "#6B4E2A"
  let borderColor = "rgba(107,78,42,0.25)"
  let cursor = "pointer"

  if (isDisabled && isIdle) {
    bgColor = "rgba(107,78,42,0.05)"
    textColor = "#D5C3B0"
    borderColor = "rgba(107,78,42,0.1)"
    cursor = "not-allowed"
  } else if (isSuccess) {
    bgColor = "rgba(92,96,41,0.1)"
    textColor = "#5C6029"
    borderColor = "rgba(92,96,41,0.25)"
  } else if (isError) {
    bgColor = "rgba(186,26,26,0.08)"
    textColor = "#BA1A1A"
    borderColor = "rgba(186,26,26,0.2)"
  } else if (isLoading) {
    bgColor = "rgba(107,78,42,0.06)"
    textColor = "#6B4E2A"
    borderColor = "rgba(107,78,42,0.15)"
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled && isIdle}
      aria-label={
        isSuccess ? "Ditambahkan ke keranjang" :
        isError ? (errorMsg ?? "Gagal") :
        isLoading ? "Menambahkan..." :
        hasStock ? "Tambah ke Keranjang" : "Stok Habis"
      }
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${className ?? ""}`}
      style={{ background: bgColor, color: textColor, border: `1px solid ${borderColor}`, cursor }}
    >
      {isLoading ? (
        <span
          className="w-3.5 h-3.5 rounded-full border-2 animate-spin inline-block shrink-0"
          style={{ borderTopColor: "#6B4E2A", borderColor: "#D5C3B0" }}
        />
      ) : isSuccess ? (
        <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      ) : isError ? (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      ) : (
        <ShoppingCart className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      )}
      <span className="whitespace-nowrap truncate">
        {isLoading ? "Menambahkan..." :
         isSuccess ? "Ditambahkan!" :
         isError ? (errorMsg ?? "Gagal") :
         hasStock ? "Tambah ke Keranjang" : "Stok Habis"}
      </span>
    </button>
  )
}
