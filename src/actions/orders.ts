"use server"

import { createClient } from "@/lib/supabase/server"
import { CartItem } from "@/types"
import { createSnapTransaction } from "@/lib/midtrans"

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

export async function createMidtransOrder(items: CartItem[]): Promise<CreateOrderResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: "Login diperlukan untuk checkout" }
  if (!items || items.length === 0) return { success: false, error: "Keranjang kosong" }

  // Re-validasi harga & stok dari DB — jangan percaya harga dari client
  const productIds = items.map((i) => i.product_id)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, stock, status")
    .in("id", productIds)

  if (productsError || !products) {
    return { success: false, error: "Gagal memverifikasi produk" }
  }

  const productMap = new Map(products.map((p) => [p.id, p]))
  let totalAmount = 0
  const verifiedItems: { product_id: string; name: string; price: number; quantity: number }[] = []

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

  const orderCode = generateOrderCode()

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

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

  if (insertError) {
    return { success: false, error: "Gagal membuat order: " + insertError.message }
  }

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
    const msg = err instanceof Error ? err.message : "Gagal membuat transaksi Midtrans"
    return { success: false, error: msg }
  }
}