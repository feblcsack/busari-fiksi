"use client"

/**
 * GlobalCart — dipasang di root layout.
 * Mengambil cart items saat pertama mount (client-side),
 * lalu render floating CartButton yang tersedia di semua halaman.
 */

import { useEffect, useState } from "react"
import { CartProvider } from "@/context/cart-context"
import { CartButton } from "./cart-button"
import { CartItem } from "@/types"
import { getCart } from "@/actions/cart"

function CartButtonWithLoader() {
  const [initialItems, setInitialItems] = useState<CartItem[] | null>(null)

  useEffect(() => {
    // Fetch cart items dari server saat client mount
    getCart()
      .then(setInitialItems)
      .catch(() => setInitialItems([]))
  }, [])

  // Belum selesai fetch — render provider dengan empty state (tidak blok UI)
  return (
    <CartProvider initialItems={initialItems ?? []}>
      <CartButton />
    </CartProvider>
  )
}

export function GlobalCart() {
  return <CartButtonWithLoader />
}
