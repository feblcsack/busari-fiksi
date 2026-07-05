"use client"

/**
 * GlobalCart — satu-satunya CartProvider di seluruh app.
 * Dipasang di root layout, jadi semua halaman share state keranjang yang sama.
 *
 * Flow:
 * 1. Render CartProvider dengan empty items (tidak blok SSR/render awal)
 * 2. Setelah client mount, fetch cart dari server dan sync ke context
 * 3. Floating CartButton tersedia di semua halaman
 */

import { useEffect, useState, useRef } from "react"
import { CartProvider } from "@/context/cart-context"
import { CartButton } from "./cart-button"
import { CartItem } from "@/types"
import { getCart } from "@/actions/cart"

function CartInner() {
  const [initialItems, setInitialItems] = useState<CartItem[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    getCart()
      .then((items) => setInitialItems(items))
      .catch(() => {/* silent — user mungkin belum login */})
  }, [])

  return (
    <CartProvider initialItems={initialItems}>
      <CartButton />
    </CartProvider>
  )
}

export function GlobalCart() {
  return <CartInner />
}
