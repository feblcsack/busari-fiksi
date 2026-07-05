"use client"

/**
 * CartContext — single source of truth untuk cart di seluruh app.
 *
 * Arsitektur:
 * - Satu CartProvider dipasang di root layout via GlobalCart
 * - ShopClient & komponen lain consume context yang sama — tidak ada duplicate provider
 * - Optimistic update: state diupdate SEBELUM server call selesai
 * - Fire-and-forget server sync: addItem return success langsung setelah optimistic update
 * - Rollback otomatis jika server gagal
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
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
  isSyncing: boolean
  addItem: (
    productId: string,
    productData: { name: string; price: number; image_url: string | null; stock?: number | null }
  ) => { success: boolean; error?: string }
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearAllItems: () => void
  hydrateFromServer?: (items: CartItem[]) => void
}

// ── Pure state helpers ────────────────────────────────────────────────────

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
  const [items, setItems] = useState<CartItem[]>(initialItems)
  const [isSyncing, setIsSyncing] = useState(false)
  const itemsRef = useRef(items)
  itemsRef.current = items

  // Sync when initialItems changes
  useEffect(() => {
    setItems(initialItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialItems)])

  // Public method to hydrate cart from server (used by GlobalCart)
  const hydrateFromServer = useCallback((serverItems: CartItem[]) => {
    setItems(serverItems)
  }, [])

  // ── addItem ──────────────────────────────────────────────────────────────
  const addItem = useCallback(
    (
      productId: string,
      productData: { name: string; price: number; image_url: string | null; stock?: number | null }
    ): { success: boolean; error?: string } => {
      const current = itemsRef.current
      const existing = current.find((i) => i.product_id === productId)
      const currentQty = existing?.quantity ?? 0
      const stock = productData.stock

      if (stock !== null && stock !== undefined && currentQty + 1 > stock) {
        return { success: false, error: "Stok tidak mencukupi." }
      }

      const optimisticItem: CartItem = {
        product_id: productId,
        quantity: 1,
        price_at_addition: productData.price,
        name: productData.name,
        image_url: productData.image_url,
      }

      const nextItems = applyAdd(current, optimisticItem)
      setItems(nextItems)

      setIsSyncing(true)
      serverAddToCart(productId, 1)
        .then((result) => {
          if (result.success) setItems(result.items)
          else setItems(current)
        })
        .catch(() => setItems(current))
        .finally(() => setIsSyncing(false))

      return { success: true }
    },
    []
  )

  // ── removeItem ────────────────────────────────────────────────────────────
  const removeItem = useCallback((productId: string) => {
    const current = itemsRef.current
    setItems(applyRemove(current, productId))
    setIsSyncing(true)
    serverRemoveFromCart(productId)
      .then((result) => { if (result.success) setItems(result.items); else setItems(current) })
      .catch(() => setItems(current))
      .finally(() => setIsSyncing(false))
  }, [])

  // ── updateQuantity ─────────────────────────────────────────────────────────
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    const current = itemsRef.current
    setItems(applyUpdateQty(current, productId, quantity))
    setIsSyncing(true)
    serverUpdateQty(productId, quantity)
      .then((result) => { if (result.success) setItems(result.items); else setItems(current) })
      .catch(() => setItems(current))
      .finally(() => setIsSyncing(false))
  }, [])

  // ── clearAllItems ──────────────────────────────────────────────────────────
  const clearAllItems = useCallback(() => {
    const current = itemsRef.current
    setItems([])
    setIsSyncing(true)
    serverClearCart()
      .then((result) => { if (!result.success) setItems(current) })
      .catch(() => setItems(current))
      .finally(() => setIsSyncing(false))
  }, [])

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.price_at_addition * i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, isSyncing, addItem, removeItem, updateQuantity, clearAllItems, hydrateFromServer }}
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

/**
 * Safe version — returns null if no provider.
 * Dipakai di komponen yang mungkin render sebelum provider mount.
 */
export function useCartSafe(): CartContextValue | null {
  return useContext(CartContext)
}
