"use client"

import { useState, useEffect } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { CartDrawer } from "./cart-drawer"

export function CartButton() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)
  const [bounce, setBounce] = useState(false)
  const [prevCount, setPrevCount] = useState(totalItems)

  // Trigger bounce animation when item count increases
  useEffect(() => {
    if (totalItems > prevCount) {
      setBounce(true)
      const t = setTimeout(() => setBounce(false), 600)
      return () => clearTimeout(t)
    }
    setPrevCount(totalItems)
  }, [totalItems, prevCount])

  return (
    <>
      {/* Floating button — pojok kanan bawah, di atas BottomNav */}
      <button
        onClick={() => setOpen(true)}
        aria-label={`Keranjang belanja — ${totalItems} item`}
        className="fixed z-40 flex items-center justify-center transition-all duration-300 active:scale-95 focus-visible:outline-none"
        style={{
          bottom: "88px",   // di atas bottom nav (80px) + 8px gap
          right: "20px",
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          background: "#6B4E2A",
          boxShadow: totalItems > 0
            ? "0 8px 24px rgba(107,78,42,0.45), 0 2px 8px rgba(107,78,42,0.2)"
            : "0 4px 16px rgba(107,78,42,0.25), 0 2px 6px rgba(107,78,42,0.12)",
          transform: bounce ? "scale(1.15)" : "scale(1)",
        }}
      >
        <ShoppingCart
          className="w-5 h-5 text-white"
          strokeWidth={2}
          style={{
            transform: bounce ? "rotate(-12deg)" : "rotate(0deg)",
            transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />

        {/* Badge */}
        {totalItems > 0 && (
          <span
            className="absolute flex items-center justify-center text-[10px] font-bold leading-none"
            style={{
              top: "-6px",
              right: "-6px",
              minWidth: "20px",
              height: "20px",
              padding: "0 5px",
              borderRadius: "10px",
              background: "#FFDDB8",
              color: "#261200",
              border: "2px solid #6B4E2A",
              boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            }}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
