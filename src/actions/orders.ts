"use server"

import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { CartItem, Order, OrderItem } from "@/types"
import { createSnapTransaction } from "@/lib/midtrans"
import { revalidatePath } from "next/cache"

function generateOrderCode() {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `INV-${Date.now()}-${rand}`
}

export interface CreateOrderResult {
  success: boolean
  snapToken?: string
  orderCode?: string
  error?: string
}

// ── Validate and prepare items from DB ───────────────────────────────────
async function validateItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  items: CartItem[]
): Promise<
  | { success: true; verifiedItems: OrderItem[]; totalAmount: number }
  | { success: false; error: string }
> {
  const productIds = items.map((i) => i.product_id)
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, price, stock, status")
    .in("id", productIds)

  if (error || !products) return { success: false, error: "Gagal memverifikasi produk" }

  const productMap = new Map(products.map((p) => [p.id, p]))
  let totalAmount = 0
  const verifiedItems: OrderItem[] = []

  for (const item of items) {
    const product = productMap.get(item.product_id)
    if (!product || product.status !== "approved") {
      return { success: false, error: `Produk "${item.name}" tidak lagi tersedia` }
    }
    if (product.stock !== null && product.stock !== undefined && item.quantity > product.stock) {
      return { success: false, error: `Stok "${product.name}" tidak mencukupi` }
    }
    totalAmount += product.price * item.quantity
    verifiedItems.push({
      product_id: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
    })
  }

  if (totalAmount <= 0) return { success: false, error: "Total belanja tidak valid" }
  return { success: true, verifiedItems, totalAmount }
}

// ── Create Midtrans order ─────────────────────────────────────────────────
export async function createMidtransOrder(items: CartItem[]): Promise<CreateOrderResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Login diperlukan untuk checkout" }
  if (!items || items.length === 0) return { success: false, error: "Keranjang kosong" }

  const validation = await validateItems(supabase, items)
  if (!validation.success) return { success: false, error: validation.error }
  const { verifiedItems, totalAmount } = validation

  const orderCode = generateOrderCode()
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

  const { error: insertError } = await supabase.from("orders").insert({
    order_code: orderCode,
    user_id: user.id,
    customer_name: profile?.full_name ?? null,
    customer_email: profile?.email ?? user.email ?? null,
    items: verifiedItems,
    total_amount: totalAmount,
    payment_method: "midtrans",
    status: "pending",
  })

  if (insertError) return { success: false, error: "Gagal membuat order: " + insertError.message }

  try {
    const snap = await createSnapTransaction({
      orderId: orderCode,
      grossAmount: totalAmount,
      customerName: profile?.full_name ?? "Pelanggan Busari",
      customerEmail: profile?.email ?? user.email ?? "customer@busari.app",
      items: verifiedItems.map((i) => ({
        id: i.product_id,
        price: i.price,
        quantity: i.quantity,
        name: i.name.slice(0, 50),
      })),
    })

    await supabase.from("orders").update({ snap_token: snap.token }).eq("order_code", orderCode)
    return { success: true, snapToken: snap.token, orderCode }
  } catch (err) {
    await supabase.from("orders").update({ status: "failed" }).eq("order_code", orderCode)
    return { success: false, error: err instanceof Error ? err.message : "Gagal membuat transaksi Midtrans" }
  }
}

// ── Create WhatsApp order ─────────────────────────────────────────────────
export async function createWhatsappOrder(
  items: CartItem[],
  note?: string
): Promise<CreateOrderResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Login diperlukan untuk checkout" }
  if (!items || items.length === 0) return { success: false, error: "Keranjang kosong" }

  const validation = await validateItems(supabase, items)
  if (!validation.success) return { success: false, error: validation.error }
  const { verifiedItems, totalAmount } = validation

  const orderCode = generateOrderCode()
  const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", user.id).single()

  const { error: insertError } = await supabase.from("orders").insert({
    order_code: orderCode,
    user_id: user.id,
    customer_name: profile?.full_name ?? null,
    customer_email: profile?.email ?? user.email ?? null,
    items: verifiedItems,
    total_amount: totalAmount,
    payment_method: "whatsapp",
    status: "pending",
    whatsapp_note: note ?? null,
  })

  if (insertError) return { success: false, error: "Gagal membuat order: " + insertError.message }
  return { success: true, orderCode }
}

// ── Get buyer's own orders ────────────────────────────────────────────────
export async function getMyOrders(): Promise<Order[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []
  return (data || []) as Order[]
}

// ── Admin: get all orders ─────────────────────────────────────────────────
export async function adminGetAllOrders(): Promise<(Order & { buyer_name?: string | null; buyer_email?: string | null })[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Check admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") throw new Error("Unauthorized")

  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      profiles:user_id (
        full_name,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) return []

  return (data || []).map((o: Record<string, unknown>) => {
    const profiles = o.profiles as { full_name?: string | null; email?: string | null } | null
    const { profiles: _ignored, ...rest } = o
    void _ignored
    return {
      ...(rest as unknown as Order),
      buyer_name: profiles?.full_name ?? o.customer_name as string ?? null,
      buyer_email: profiles?.email ?? o.customer_email as string ?? null,
    }
  })
}

// ── Admin: complete order (WA or manual) → reduce stock ──────────────────
export async function adminCompleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Unauthorized" }

  // Fetch order
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("status, items")
    .eq("id", orderId)
    .single()

  if (fetchError || !order) return { success: false, error: "Order tidak ditemukan" }
  if (order.status === "completed") return { success: false, error: "Order sudah selesai" }

  // Use service role to bypass RLS for stock update
  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Update order status
  const { error: updateError } = await serviceClient
    .from("orders")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", orderId)

  if (updateError) return { success: false, error: updateError.message }

  // Reduce stock for each item (only if not already done for paid midtrans orders)
  const shouldReduceStock = order.status !== "paid" // paid midtrans already reduced stock via webhook
  if (shouldReduceStock) {
    const items = order.items as OrderItem[]
    for (const item of items) {
      await serviceClient.rpc("decrement_product_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }
  }

  revalidatePath("/admin/orders")
  revalidatePath("/dashboard/orders")
  return { success: true }
}

// ── Admin: cancel order ───────────────────────────────────────────────────
export async function adminCancelOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Not authenticated" }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return { success: false, error: "Unauthorized" }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId)

  if (error) return { success: false, error: error.message }

  revalidatePath("/admin/orders")
  return { success: true }
}
