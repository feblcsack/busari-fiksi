"use client"

/**
 * GlobalCart — satu-satunya CartProvider di seluruh app.
 *
 * CartProvider dipasang di sini (bukan lazy) sehingga semua komponen
 * yang pakai useCart() — termasuk AddToCartButton di shop — tidak error
 * meskipun render sebelum data cart selesai di-fetch.
 *
 * CartLoader fetch cart dari server setelah mount, lalu hydrate context
 * dengan satu call setItems (bukan addItem per item).
 */

import { useEffect, useRef } from "react"
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
      .then((serverItems) => {
        if (serverItems.length > 0 && hydrateFromServer) {
          hydrateFromServer(serverItems)
        }
      })
      .catch(() => {
        // User belum login atau tidak ada cart — normal, biarkan kosong
      })
  }, [hydrateFromServer])

  return null
}

export function GlobalCart() {
  return (
    <CartProvider initialItems={[]}>
      <CartLoader />
      <CartButton />
    </CartProvider>
  )
}
