"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { Product, Profile, AdminStats } from "@/types"

// Check if current user is admin
async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  // If the role column doesn't exist yet, the query may error — treat as not admin
  if (error) throw new Error("Unauthorized: Could not verify admin role. Jalankan SQL migration di ADMIN_SETUP.md terlebih dahulu.")

  if (profile?.role !== "admin") throw new Error("Unauthorized: Admin access required")
  return { supabase, user }
}

// ── GET ALL PRODUCTS (admin view, all users) ──────────────────────────────
// ── GET ALL PRODUCTS (admin view, all users) ──────────────────────────────
export async function adminGetAllProducts(): Promise<(Product & { seller_name?: string | null; seller_email?: string | null })[]> {
  const { supabase } = await requireAdmin()

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("adminGetAllProducts error:", error.message)
    return []
  }

  if (!products || products.length === 0) return []

  // Ambil semua profiles yang relevan secara terpisah (hindari join yang rawan gagal)
  const userIds = [...new Set(products.map((p) => p.user_id))]
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .in("id", userIds)

  if (profilesError) {
    console.error("adminGetAllProducts profiles error:", profilesError.message)
  }

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { full_name: p.full_name, email: p.email }])
  )

  return products.map((p) => ({
    ...p,
    seller_name: profileMap.get(p.user_id)?.full_name ?? null,
    seller_email: profileMap.get(p.user_id)?.email ?? null,
  }))
}

// ── GET ALL USERS ─────────────────────────────────────────────────────────
export async function adminGetAllUsers(): Promise<Profile[]> {
  const { supabase } = await requireAdmin()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}

// ── GET ADMIN STATS ───────────────────────────────────────────────────────
export async function adminGetStats(): Promise<AdminStats> {
  const { supabase } = await requireAdmin()

  const [usersResult, productsResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("products").select("price, status"),
  ])

  const products = (productsResult.data || []) as { price: number; status: string | null }[]
  const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0), 0)

  return {
    totalUsers: usersResult.count ?? 0,
    totalProducts: products.length,
    // Products without status column (null) also count as pending
    pendingReviews: products.filter((p) => !p.status || p.status === "pending").length,
    approvedProducts: products.filter((p) => p.status === "approved").length,
    rejectedProducts: products.filter((p) => p.status === "rejected").length,
    totalValue,
  }
}

// ── UPDATE PRODUCT STATUS (review) ───────────────────────────────────────
export async function adminReviewProduct(productId: string, status: "approved" | "rejected" | "pending", note?: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase
    .from("products")
    .update({ status, review_note: note ?? null })
    .eq("id", productId)

  if (error) throw new Error(error.message)

  revalidatePath("/admin", "layout")
  revalidatePath("/admin/products")
  revalidatePath("/admin/reviews")
  revalidatePath("/admin/product-reviews")
  revalidatePath("/shop")
  revalidatePath("/dashboard", "layout")
  return { success: true }
}

// ── ADMIN CREATE PRODUCT (for any user) ──────────────────────────────────
export async function adminCreateProduct(formData: FormData) {
  const { supabase } = await requireAdmin()

  const user_id = formData.get("user_id") as string
  const name = (formData.get("name") as string)?.trim()
  const description = (formData.get("description") as string) ?? null
  const price = parseInt(formData.get("price") as string, 10)
  const imageFile = formData.get("image") as File | null

  if (!user_id) throw new Error("Penjual tidak boleh kosong")
  if (!name) throw new Error("Nama produk wajib diisi")
  if (Number.isNaN(price) || price < 0) throw new Error("Harga produk tidak valid")

  let image_url: string | null = null

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `admin-${user_id}-${Date.now()}.${fileExt}`
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, buffer, { contentType: imageFile.type, upsert: true })
    if (uploadError) throw new Error(uploadError.message)
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)
    image_url = urlData.publicUrl
  }

  const { error } = await supabase.from("products").insert({ user_id, name, description, price, image_url, status: "approved" })
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  return { success: true }
}

// ── ADMIN UPDATE PRODUCT ─────────────────────────────────────────────────
export async function adminUpdateProduct(id: string, formData: FormData) {
  const { supabase } = await requireAdmin()

  const name = (formData.get("name") as string)?.trim()
  const description = (formData.get("description") as string) ?? null
  const price = parseInt(formData.get("price") as string, 10)
  const imageFile = formData.get("image") as File | null

  if (!name) throw new Error("Nama produk wajib diisi")
  if (Number.isNaN(price) || price < 0) throw new Error("Harga produk tidak valid")

  const updateData: Partial<Product> = { name, description, price }

  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `admin-${Date.now()}.${fileExt}`
    const buffer = Buffer.from(await imageFile.arrayBuffer())
    const { error: uploadError } = await supabase.storage.from("images").upload(fileName, buffer, { contentType: imageFile.type, upsert: true })
    if (uploadError) throw new Error(uploadError.message)
    const { data: urlData } = supabase.storage.from("images").getPublicUrl(fileName)
    updateData.image_url = urlData.publicUrl
  }

  const { error } = await supabase.from("products").update(updateData).eq("id", id)
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  return { success: true }
}

// ── ADMIN DELETE PRODUCT ─────────────────────────────────────────────────
export async function adminDeleteProduct(id: string) {
  const { supabase } = await requireAdmin()

  const { data: product } = await supabase.from("products").select("image_url").eq("id", id).single()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (error) throw new Error(error.message)

  if (product?.image_url) {
    const urlParts = product.image_url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    await supabase.storage.from("images").remove([fileName])
  }

  revalidatePath("/admin")
  revalidatePath("/admin/products")
  revalidatePath("/shop")
  return { success: true }
}

// ── ADMIN UPDATE USER ROLE ────────────────────────────────────────────────
export async function adminUpdateUserRole(userId: string, role: string) {
  const { supabase } = await requireAdmin()

  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId)
  if (error) throw new Error(error.message)

  revalidatePath("/admin")
  revalidatePath("/admin/users")
  return { success: true }
}

// ── ADMIN DELETE USER PRODUCT DATA ───────────────────────────────────────
export async function adminDeleteAllUserProducts(userId: string) {
  const { supabase } = await requireAdmin()

  const { data: products } = await supabase.from("products").select("image_url").eq("user_id", userId)
  const { error } = await supabase.from("products").delete().eq("user_id", userId)
  if (error) throw new Error(error.message)

  if (products && products.length > 0) {
    const fileNames = products.filter((p: { image_url: string | null }) => p.image_url).map((p: { image_url: string }) => {
      const parts = p.image_url.split("/")
      return parts[parts.length - 1]
    })
    if (fileNames.length > 0) await supabase.storage.from("images").remove(fileNames)
  }

  revalidatePath("/admin")
  revalidatePath("/shop")
  return { success: true }
}

// ── CHECK IF CURRENT USER IS ADMIN ───────────────────────────────────────
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (error) return false
    return profile?.role === "admin"
  } catch {
    return false
  }
}
