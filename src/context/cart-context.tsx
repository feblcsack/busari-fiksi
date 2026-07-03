"use client"

import {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { CartItem } from "@/types"
import {
  addToCart as serverAddToCart,
  removeFromCart as serverRemoveFromCart,
  updateCartItemQuantity as serverUpdateQty,
  clearCart as serverClearCart,
} from "@/actions/cart"

// ── Types ─────────────────────────────────────────────────────────────────

interface CartContextValue {
  items: CartItem[]
  totalItems: number
  totalPrice: number
  isPending: boolean
  addItem: (
    productId: string,
    productData: { name: string; price: number; image_url: string | null; stock?: number | null }
  ) => Promise<{ success: boolean; error?: string }>
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearAllItems: () => void
}

// ── Pure reducer ──────────────────────────────────────────────────────────

function applyAdd(items: CartItem[], newItem: CartItem): CartItem[] {
  const idx = items.findIndex((i) => i.product_id === newItem.product_id)
  if (idx >= 0) {
    return items.map((item, i) =>
      i === idx ? { ...item, quantity: item.quantity + newItem.quantity } : item
    )
  }
  return [...items, newItem]
}

function applyRemove(items: CartItem[], productId: string): CartItem[] {
  return items.filter((i) => i.product_id !== productId)
}

function applyUpdateQty(items: CartItem[], productId: string, quantity: number): CartItem[] {
  if (quantity <= 0) return applyRemove(items, productId)
  return items.map((item) =>
    item.product_id === productId ? { ...item, quantity } : item
  )
}

// ── Context ───────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

interface CartProviderProps {
  children: ReactNode
  initialItems?: CartItem[]
}

export function CartProvider({ children, initialItems = [] }: CartProviderProps) {
  // Single source of truth — plain useState, no useOptimistic conflicts
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [isPending, startTransition] = useTransition()

  // Re-sync if initialItems prop changes (e.g. after server rerender)
  useEffect(() => {
    setItems(initialItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialItems)])

  // ── addItem ──────────────────────────────────────────────────────────────
  const addItem = useCallback(
    async (
      productId: string,
      productData: { name: string; price: number; image_url: string | null; stock?: number | null }
    ): Promise<{ success: boolean; error?: string }> => {
      // Client-side stock guard
      const existing = items.find((i) => i.product_id === productId)
      const currentQty = existing?.quantity ?? 0
      const stock = productData.stock
      if (stock !== null && stock !== undefined && currentQty + 1 > stock) {
        return { success: false, error: "Stok tidak mencukupi." }
      }

      // Optimistic update immediately
      const optimisticItem: CartItem = {
        product_id: productId,
        quantity: 1,
        price_at_addition: productData.price,
        name: productData.name,
        image_url: productData.image_url,
      }
      const optimisticState = applyAdd(items, optimisticItem)
      setItems(optimisticState)

      // Fire server call
      try {
        const result = await serverAddToCart(productId, 1)
        if (result.success) {
          setItems(result.items)
          return { success: true }
        } else {
          // Rollback
          setItems(items)
          return { success: false, error: result.error }
        }
      } catch (err) {
        // Rollback on network error
        setItems(items)
        return { success: false, error: err instanceof Error ? err.message : "Gagal menambahkan ke keranjang" }
      }
    },
    [items]
  )

  // ── removeItem ───────────────────────────────────────────────────────────
  const removeItem = useCallback(
    (productId: string) => {
      const optimistic = applyRemove(items, productId)
      setItems(optimistic)
      startTransition(async () => {
        const result = await serverRemoveFromCart(productId)
        if (result.success) {
          setItems(result.items)
        } else {
          setItems(items) // rollback
        }
      })
    },
    [items, startTransition]
  )

  // ── updateQuantity ───────────────────────────────────────────────────────
  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const optimistic = applyUpdateQty(items, productId, quantity)
      setItems(optimistic)
      startTransition(async () => {
        const result = await serverUpdateQty(productId, quantity)
        if (result.success) {
          setItems(result.items)
        } else {
          setItems(items) // rollback
        }
      })
    },
    [items, startTransition]
  )

  // ── clearAllItems ─────────────────────────────────────────────────────────
  const clearAllItems = useCallback(() => {
    const prev = items
    setItems([])
    startTransition(async () => {
      const result = await serverClearCart()
      if (!result.success) {
        setItems(prev) // rollback
      }
    })
  }, [items, startTransition])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price_at_addition * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, isPending, addItem, removeItem, updateQuantity, clearAllItems }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>")
  return ctx
}
