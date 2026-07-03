"use client"

import { useState, useTransition } from "react"
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
  const [, startTransition] = useTransition()

  // Only active if product is approved and has stock (or stock not tracked)
  const stock = product.stock
  const isApproved = product.status === "approved" || product.status == null
  const hasStock = stock === null || stock === undefined || stock > 0
  const isDisabled = !isApproved || !hasStock || state === "loading"

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Don't open product detail modal
    if (isDisabled) return

    setState("loading")
    setErrorMsg(null)

    startTransition(async () => {
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
    })
  }

  const config: Record<ButtonState, { icon: React.ReactNode; label: string; style: React.CSSProperties }> = {
    idle: {
      icon: <ShoppingCart className="w-3.5 h-3.5" strokeWidth={2} />,
      label: hasStock ? "Tambah ke Keranjang" : "Stok Habis",
      style: {
        background: isDisabled ? "rgba(107,78,42,0.05)" : "rgba(107,78,42,0.1)",
        color: isDisabled ? "#D5C3B0" : "#6B4E2A",
        border: `1px solid ${isDisabled ? "rgba(107,78,42,0.1)" : "rgba(107,78,42,0.25)"}`,
        cursor: isDisabled ? "not-allowed" : "pointer",
      },
    },
    loading: {
      icon: (
        <span className="w-3.5 h-3.5 rounded-full border-2 animate-spin inline-block"
          style={{ borderTopColor: "#6B4E2A", borderColor: "#D5C3B0" }} />
      ),
      label: "Menambahkan...",
      style: { background: "rgba(107,78,42,0.08)", color: "#6B4E2A", border: "1px solid rgba(107,78,42,0.2)" },
    },
    success: {
      icon: <Check className="w-3.5 h-3.5" strokeWidth={2.5} />,
      label: "Ditambahkan!",
      style: { background: "rgba(92,96,41,0.1)", color: "#5C6029", border: "1px solid rgba(92,96,41,0.25)" },
    },
    error: {
      icon: <AlertCircle className="w-3.5 h-3.5" strokeWidth={2} />,
      label: errorMsg ?? "Gagal",
      style: { background: "rgba(186,26,26,0.08)", color: "#BA1A1A", border: "1px solid rgba(186,26,26,0.2)" },
    },
  }

  const { icon, label, style } = config[state]

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled && state === "idle"}
      aria-label={label}
      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${className ?? ""}`}
      style={style}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
    </button>
  )
}
