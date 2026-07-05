"use client"

/**
 * CartWrapper — wraps ALL children with CartProvider.
 * Dipasang di root layout sehingga useCart() tersedia di mana saja
 * tanpa tergantung urutan render atau timing hydration.
 *
 * CartLoader fetch cart dari server setelah mount dan hydrate context.
 * CartButton float di pojok kanan bawah.
 */

import { useEffect, useRef, type ReactNode } from "react"
import { CartProvider, useCart } from "@/context/cart-context"
import { CartButton } from "./cart-button"
import { getCart } from "@/actions/cart"

function CartLoader() {
  const { hydrateFromServer } = useCart()
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    getCart()
      .then((items) => {
        if (items.length > 0 && hydrateFromServer) {
          hydrateFromServer(items)
        }
      })
      .catch(() => {
        // Not logged in — cart kosong, normal
      })
  }, [hydrateFromServer])

  return null
}

interface CartWrapperProps {
  children: ReactNode
}

export function CartWrapper({ children }: CartWrapperProps) {
  return (
    <CartProvider initialItems={[]}>
      {/* CartLoader sync dari server setelah mount */}
      <CartLoader />
      {/* Semua page content — CartProvider sudah ada di sini */}
      {children}
      {/* Floating cart button */}
      <CartButton />
    </CartProvider>
  )
}
