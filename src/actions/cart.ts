"use server"

import { createClient } from "@/lib/supabase/server"
import { CartItem } from "@/types"

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Exponential backoff retry for Supabase writes.
 * Retries up to `maxRetries` times with doubling delay.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelayMs = 200
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxRetries) throw err
      await new Promise((res) =>
        setTimeout(res, baseDelayMs * Math.pow(2, attempt))
      )
    }
  }
  throw new Error("Unreachable")
}

// ── Server Actions ────────────────────────────────────────────────────────

/**
 * Get the current user's cart, or null if not authenticated.
 */
export async function getCart(): Promise<CartItem[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .single()

  if (!data?.items) return []
  return data.items as CartItem[]
}

/**
 * Add a product to cart. Validates stock against DB before writing.
 * Uses exponential backoff on network failures.
 *
 * Returns the new cart items array.
 */
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; items: CartItem[]; error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, items: [], error: "Login untuk menambahkan ke keranjang" }

  // Fetch product to validate status + stock
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, name, price, image_url, status, stock")
    .eq("id", productId)
    .single()

  if (productError || !product) {
    return { success: false, items: [], error: "Produk tidak ditemukan" }
  }
  if (product.status !== "approved") {
    return { success: false, items: [], error: "Produk ini belum tersedia di toko" }
  }

  // Fetch current cart
  const { data: cartRow } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .single()

  const currentItems: CartItem[] = (cartRow?.items as CartItem[]) ?? []

  // Find if this product is already in cart
  const existingIdx = currentItems.findIndex((i) => i.product_id === productId)
  const currentQty = existingIdx >= 0 ? currentItems[existingIdx].quantity : 0
  const newQty = currentQty + quantity

  // Stock validation — only enforce if stock field is set
  const stock = product.stock as number | null
  if (stock !== null && stock !== undefined && newQty > stock) {
    return {
      success: false,
      items: currentItems,
      error: `Stok tidak mencukupi. Tersisa ${stock - currentQty} item.`,
    }
  }

  // Build updated items array
  let updatedItems: CartItem[]
  if (existingIdx >= 0) {
    updatedItems = currentItems.map((item, idx) =>
      idx === existingIdx ? { ...item, quantity: newQty } : item
    )
  } else {
    updatedItems = [
      ...currentItems,
      {
        product_id: productId,
        quantity,
        price_at_addition: product.price,
        name: product.name,
        image_url: product.image_url ?? null,
      },
    ]
  }

  // Upsert cart with exponential backoff
  await withRetry(async () => {
    const { error } = await supabase.from("carts").upsert(
      {
        user_id: user.id,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) throw new Error(error.message)
  })

  return { success: true, items: updatedItems }
}

/**
 * Remove a product from cart entirely.
 */
export async function removeFromCart(
  productId: string
): Promise<{ success: boolean; items: CartItem[] }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, items: [] }

  const { data: cartRow } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .single()

  const currentItems: CartItem[] = (cartRow?.items as CartItem[]) ?? []
  const updatedItems = currentItems.filter((i) => i.product_id !== productId)

  await withRetry(async () => {
    const { error } = await supabase.from("carts").upsert(
      {
        user_id: user.id,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) throw new Error(error.message)
  })

  return { success: true, items: updatedItems }
}

/**
 * Update quantity of a cart item. Pass 0 to remove.
 */
export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<{ success: boolean; items: CartItem[] }> {
  if (quantity <= 0) return removeFromCart(productId)

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, items: [] }

  const { data: cartRow } = await supabase
    .from("carts")
    .select("items")
    .eq("user_id", user.id)
    .single()

  const currentItems: CartItem[] = (cartRow?.items as CartItem[]) ?? []
  const updatedItems = currentItems.map((item) =>
    item.product_id === productId ? { ...item, quantity } : item
  )

  await withRetry(async () => {
    const { error } = await supabase.from("carts").upsert(
      {
        user_id: user.id,
        items: updatedItems,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) throw new Error(error.message)
  })

  return { success: true, items: updatedItems }
}

/**
 * Clear the entire cart.
 */
export async function clearCart(): Promise<{ success: boolean }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false }

  await withRetry(async () => {
    const { error } = await supabase.from("carts").upsert(
      {
        user_id: user.id,
        items: [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    )
    if (error) throw new Error(error.message)
  })

  return { success: true }
}
