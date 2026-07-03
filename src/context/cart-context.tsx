"use client"

import {
  createContext,
  useContext,
  useOptimistic,
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

type OptimisticAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; productId: string }
  | { type: "UPDATE_QTY"; productId: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "SYNC"; items: CartItem[] }

// ── Reducer ───────────────────────────────────────────────────────────────

function cartReducer(state: CartItem[], action: OptimisticAction): CartItem[] {
  switch (action.type) {
    case "SYNC":
      return action.items
    case "ADD": {
      const existing = state.findIndex((i) => i.product_id === action.item.product_id)
      if (existing >= 0) {
        return state.map((item, idx) =>
          idx === existing
            ? { ...item, quantity: item.quantity + action.item.quantity }
            : item
        )
      }
      return [...state, action.item]
    }
    case "REMOVE":
      return state.filter((i) => i.product_id !== action.productId)
    case "UPDATE_QTY":
      if (action.quantity <= 0) {
        return state.filter((i) => i.product_id !== action.productId)
      }
      return state.map((item) =>
        item.product_id === action.productId
          ? { ...item, quantity: action.quantity }
          : item
      )
    case "CLEAR":
      return []
    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null)

interface CartProviderProps {
  children: ReactNode
  initialItems?: CartItem[]
}

export function CartProvider({ children, initialItems = [] }: CartProviderProps) {
  const [serverItems, setServerItems] = useState<CartItem[]>(initialItems)
  const [optimisticItems, dispatchOptimistic] = useOptimistic(serverItems, cartReducer)
  const [isPending, startTransition] = useTransition()

  // Sync server state from initial items prop whenever it changes (e.g. page refresh)
  useEffect(() => {
    setServerItems(initialItems)
  }, [initialItems]) // eslint-disable-line react-hooks/exhaustive-deps

  const addItem = useCallback(
    async (
      productId: string,
      productData: { name: string; price: number; image_url: string | null; stock?: number | null }
    ): Promise<{ success: boolean; error?: string }> => {
      // Client-side stock check before optimistic update
      const existing = serverItems.find((i) => i.product_id === productId)
      const currentQty = existing?.quantity ?? 0
      const stock = productData.stock
      if (stock !== null && stock !== undefined && currentQty + 1 > stock) {
        return { success: false, error: `Stok tidak mencukupi.` }
      }

      const optimisticItem: CartItem = {
        product_id: productId,
        quantity: 1,
        price_at_addition: productData.price,
        name: productData.name,
        image_url: productData.image_url,
      }

      let serverResult: { success: boolean; error?: string } = { success: true }

      startTransition(async () => {
        // Optimistic update happens immediately inside startTransition
        dispatchOptimistic({ type: "ADD", item: optimisticItem })

        // Sync to server
        const result = await serverAddToCart(productId, 1)
        if (result.success) {
          setServerItems(result.items)
          dispatchOptimistic({ type: "SYNC", items: result.items })
        } else {
          // Rollback by re-syncing server state
          dispatchOptimistic({ type: "SYNC", items: serverItems })
        }
        serverResult = result
      })

      // Return early optimistic success for immediate UI feedback
      // (the transition handles the real server call)
      return serverResult
    },
    [serverItems, dispatchOptimistic, startTransition]
  )

  const removeItem = useCallback(
    (productId: string) => {
      startTransition(async () => {
        dispatchOptimistic({ type: "REMOVE", productId })
        const result = await serverRemoveFromCart(productId)
        if (result.success) {
          setServerItems(result.items)
          dispatchOptimistic({ type: "SYNC", items: result.items })
        } else {
          dispatchOptimistic({ type: "SYNC", items: serverItems })
        }
      })
    },
    [serverItems, dispatchOptimistic, startTransition]
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      startTransition(async () => {
        dispatchOptimistic({ type: "UPDATE_QTY", productId, quantity })
        const result = await serverUpdateQty(productId, quantity)
        if (result.success) {
          setServerItems(result.items)
          dispatchOptimistic({ type: "SYNC", items: result.items })
        } else {
          dispatchOptimistic({ type: "SYNC", items: serverItems })
        }
      })
    },
    [serverItems, dispatchOptimistic, startTransition]
  )

  const clearAllItems = useCallback(() => {
    startTransition(async () => {
      dispatchOptimistic({ type: "CLEAR" })
      const result = await serverClearCart()
      if (result.success) {
        setServerItems([])
        dispatchOptimistic({ type: "SYNC", items: [] })
      } else {
        dispatchOptimistic({ type: "SYNC", items: serverItems })
      }
    })
  }, [serverItems, dispatchOptimistic, startTransition])

  const totalItems = optimisticItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = optimisticItems.reduce(
    (sum, i) => sum + i.price_at_addition * i.quantity,
    0
  )

  return (
    <CartContext.Provider
      value={{
        items: optimisticItems,
        totalItems,
        totalPrice,
        isPending,
        addItem,
        removeItem,
        updateQuantity,
        clearAllItems,
      }}
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
