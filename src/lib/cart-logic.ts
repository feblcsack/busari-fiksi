/**
 * Pure, side-effect-free cart logic.
 * Extracted so it can be unit-tested without Supabase or Next.js.
 */
import { CartItem } from "@/types"

export interface ProductSnapshot {
  id: string
  name: string
  price: number
  image_url: string | null
  status: string | null
  stock: number | null
}

export interface AddToCartResult {
  success: boolean
  items: CartItem[]
  error?: string
}

/**
 * Computes the new cart state after adding a product.
 * Returns the updated items array, or an error if validation fails.
 */
export function computeAddToCart(
  currentItems: CartItem[],
  product: ProductSnapshot,
  quantity: number = 1
): AddToCartResult {
  // All new products must start with status !== 'approved' before admin review
  if (product.status !== "approved") {
    return {
      success: false,
      items: currentItems,
      error: "Produk belum tersedia di toko",
    }
  }

  const existingIdx = currentItems.findIndex((i) => i.product_id === product.id)
  const currentQty = existingIdx >= 0 ? currentItems[existingIdx].quantity : 0
  const newQty = currentQty + quantity

  // Stock validation — only enforce if stock is tracked (non-null)
  if (product.stock !== null && product.stock !== undefined && newQty > product.stock) {
    return {
      success: false,
      items: currentItems,
      error: `Stok tidak mencukupi. Tersisa ${Math.max(0, product.stock - currentQty)} item.`,
    }
  }

  let updatedItems: CartItem[]
  if (existingIdx >= 0) {
    updatedItems = currentItems.map((item, idx) =>
      idx === existingIdx ? { ...item, quantity: newQty } : item
    )
  } else {
    updatedItems = [
      ...currentItems,
      {
        product_id: product.id,
        quantity,
        price_at_addition: product.price,
        name: product.name,
        image_url: product.image_url,
      },
    ]
  }

  return { success: true, items: updatedItems }
}

/**
 * Returns only the approved products from a list.
 * Used to enforce the shop display filter.
 */
export function filterApprovedProducts<T extends { status?: string | null }>(
  products: T[]
): T[] {
  return products.filter((p) => p.status === "approved")
}

/**
 * Returns the initial status for a new product submitted by a seller.
 * Per spec: every new product MUST start with 'queued' (pending review).
 */
export function getInitialProductStatus(): "queued" {
  return "queued"
}
