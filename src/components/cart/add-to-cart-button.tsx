"use client"

import { useState } from "react"
import { ShoppingCart, Check, AlertCircle } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { PublicProduct } from "@/actions/public-product"

interface AddToCartButtonProps {
  product: PublicProduct
  className?: string
}

type ButtonState = "idle" | "success" | "error"

export function AddToCartButton({ product, className }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [state, setState] = useState<ButtonState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const stock = product.stock
  const isApproved = product.status === "approved" || product.status == null
  const hasStock = stock === null || stock === undefined || stock > 0
  const isDisabled = !isApproved || !hasStock

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDisabled || state !== "idle") return

    // addItem adalah synchronous — optimistic update langsung terjadi
    const result = addItem(product.id, {
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      stock,
    })

    if (result.success) {
      // ✅ Langsung success, tidak ada loading state
      setState("success")
      setTimeout(() => setState("idle"), 1500)
    } else {
      setState("error")
      setErrorMsg(result.error ?? "Gagal menambahkan")
      setTimeout(() => { setState("idle"); setErrorMsg(null) }, 2000)
    }
  }

  const isSuccess = state === "success"
  const isError = state === "error"

  let bg = "rgba(107,78,42,0.1)"
  let color = "#6B4E2A"
  let border = "rgba(107,78,42,0.25)"
  let cursor: string = isDisabled ? "not-allowed" : "pointer"

  if (isDisabled) {
    bg = "rgba(107,78,42,0.05)"
    color = "#D5C3B0"
    border = "rgba(107,78,42,0.1)"
  } else if (isSuccess) {
    bg = "rgba(92,96,41,0.12)"
    color = "#5C6029"
    border = "rgba(92,96,41,0.3)"
    cursor = "default"
  } else if (isError) {
    bg = "rgba(186,26,26,0.08)"
    color = "#BA1A1A"
    border = "rgba(186,26,26,0.2)"
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      aria-label={
        isSuccess ? "Ditambahkan ke keranjang" :
        isError ? (errorMsg ?? "Gagal") :
        hasStock ? "Tambah ke Keranjang" : "Stok Habis"
      }
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${className ?? ""}`}
      style={{ background: bg, color, border: `1px solid ${border}`, cursor }}
    >
      {isSuccess ? (
        <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
      ) : isError ? (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      ) : (
        <ShoppingCart className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
      )}
      <span className="whitespace-nowrap truncate">
        {isSuccess ? "Ditambahkan!" :
         isError ? (errorMsg ?? "Gagal") :
         hasStock ? "Tambah ke Keranjang" : "Stok Habis"}
      </span>
    </button>
  )
}
