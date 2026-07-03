"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/context/cart-context"
import { CartDrawer } from "./cart-drawer"

export function CartButton() {
  const { totalItems } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Keranjang belanja — ${totalItems} item`}
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all hover:bg-black/5"
        style={{ color: "#6B4E2A" }}
      >
        <ShoppingCart className="w-5 h-5" strokeWidth={1.8} />
        {totalItems > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[10px] font-bold flex items-center justify-center px-1 leading-none"
            style={{ background: "#6B4E2A", color: "#FFFFFF" }}
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  )
}
